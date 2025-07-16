'use client'

import { InputForm, Modal, SelectForm } from "@components/shared/molecules";
import { TemplateBody } from "@type/api/template.type";
import { BrandQueryParams } from "@type/api/brand.type";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { object, string } from "yup";
import { apiGetBrands } from "@api/brand";
import { useState, useEffect } from "react";
import { toast } from "react-toastify"
import { TextArea } from "@components/shared/atoms";

export interface AddTemplateModalProps {
    isOpen: boolean;
    isEdit: boolean;
    brand: string;
    templateName: string;
    templateContent: string;
    setIsOpen: (value: boolean) => void;
    onSubmit: (body: TemplateBody) => Promise<any>

}
const AddTemplateModal = ({ isOpen, setIsOpen, isEdit, brand, templateName, templateContent, onSubmit }: AddTemplateModalProps) => {

    //Hook
    const t = useTranslations();

    const [brandName, setBrandName] = useState<string>("");
    const [params, setParams] = useState<Record<string, any>>({});
    const [brands, setBrands] = useState<{ label: string; value: string }[]>([]);


    const initialValues = useMemo(() => {
        return {
            brand_id: brand,
            name: templateName,
            content: templateContent,
            isEdit: isEdit
        };
    }, [brand,templateName, templateContent, isEdit]);


    const validationSchema = useMemo(() => {
        return object().shape({
            name: string()
                .min(2, t("error_message.min_length", { data: 2 }))
                .required(t("error_message.required")),

            content: string()
                .min(2, t("error_message.min_length", { data: 2 }))
                .required(t("error_message.required")),
            brand: string()

        })
    }, [])
    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
             await onSubmit(values)
        },
    });

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const queryParams: BrandQueryParams = {
                    ...(brandName && { name: brandName }),
                    ...params,
                };
                const response = await apiGetBrands(queryParams);
                if (response.code === "OK") {
                    const options = response.data.map((b) => ({
                        noTranslate: true,
                        label: b.name,
                        value: b.id,

                    }));
                    setBrands(options);
                } else {
                    toast.error(t("api.get.failed", { data: t("templates_page.brand").toLowerCase() }));
                }
            } catch (error) {
                toast.error(t("api.get.failed", { data: t("templates_page.brand").toLowerCase() }));
            }
        };

        fetchBrands();
    }, [brandName, params]);


    return (
        <Modal
            size="md"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            confirmLabel={t("form.save")}
            confirmClassName="bg-secondary-500"
            title={t("templates_page.add_template_modal.title")}
            onConfirm={formik.handleSubmit}
            onCancel={formik.handleReset}
        >
            <form className=" flex flex-col gap-4">
                <SelectForm
                    name="brand"
                    label="brands_page.title"
                    placeholder={t("select.placeholder", { data: t("brands_page.title").toLowerCase() })}
                    options={brands}
                    value={formik.values.brand_id}
                    onChange={(e) => formik.setFieldValue("brand_id", e.target.value)}
                />
                <InputForm
                    name="name"
                    noTranslateLabel
                    label={t("templates_page.name")}
                    placeholder={t("input.placeholder", { data: t("templates_page.name").toLowerCase() })}
                    onChange={formik.handleChange}
                    errorMessage={formik.errors.name}
                    value={formik.values.name}
                />
                <TextArea
                    name="content"
                    label="templates_page.content"
                    placeholder={t("input.placeholder", { data: t("templates_page.content").toLowerCase() })}
                    onChange={formik.handleChange}
                    errorMessage={formik.errors.content}
                    value={formik.values.content}
                />
            </form>
        </Modal>
    );
}
export default AddTemplateModal