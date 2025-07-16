'use client';

import { BreadcrumbItem } from "@components/shared/atoms/Breadcrumb";
import { Button, InputForm, SelectForm } from "@components/shared/molecules";
import { DefaultPageLayout } from "@components/shared/templates";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify"
import { ChangeEvent, useEffect, useState } from "react";
import { BrandQueryParams } from "@type/api/brand.type";
import { apiGetBrands } from "@api/brand";
import { Template, TemplateQueryParams } from "@type/api/template.type";
import { apiGetTemplate } from "@api/template";

const SendingManualPage = () => {
    const SENDING_MANUAL_BREADCRUMBS: BreadcrumbItem[] = [
        {
            key: "sending-manual_page",
            label: "sending-manual_page.title"
        }
    ];

    //Hook
    const t = useTranslations();

    //State
    const [brandName, setBrandName] = useState<string>("");
    const [params, setParams] = useState<Record<string, any>>({});
    const [brands, setBrands] = useState<{ label: string; value: string }[]>([]);
    const channel = [{
        label: "SMS",
        value: "SMS",
        noTranslate: true,
    }]
    const [brand_id, setBrandIDs] = useState<string>("");
    const [templates, setTemplates] = useState<{ label: string; value: string }[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");

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

    const fetchTemplate = async () => {
        try {
            const response = await apiGetTemplate({ ...params })
            if (response.code === "OK") {
                const filtered = response.data.filter((temp) => (temp.brand_id === brand_id))
                const options = filtered.map((temp) => ({
                    noTranslate: true,
                    value: temp.id,
                    label: temp.name,
                    content: temp.content,
                }));
                setTemplates(options)
            }
            else {
                toast.error(t("api.get.failed", { data: t("templates_page.brand").toLowerCase() }));
            }
        }
        catch (error) {
            toast.error(t("api.get.failed", { data: t("templates_page.brand").toLowerCase() }));
        }
    };
    useEffect(() => {
        if (brand_id) {
            fetchTemplate();
        }
    }, [brand_id]);

    const handleOnclickReset = (()=>{
        setBrandIDs("");
        setSelectedTemplate("");
    })

    return (
        <DefaultPageLayout breadcrumbs={SENDING_MANUAL_BREADCRUMBS}>
            <div className=" flex w-8/12 flex-col gap-4">

                <SelectForm
                    disabled
                    options={channel}
                    label={"sending-manual_page.channel"}
                />

                <SelectForm
                    options={brands}
                    label={"sending-manual_page.brand"}
                    value={brand_id}
                    placeholder={t("select.placeholder", { data: t("sending-manual_page.brand").toLowerCase() })}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setBrandIDs(event.target.value)}
                />

                <SelectForm
                    options={templates}
                    label={"sending-manual_page.template"}
                    value={selectedTemplate}
                    placeholder={t("select.placeholder", { data: t("sending-manual_page.template").toLowerCase() })}
                    errorMessage={(brand_id.length > 0 && selectedTemplate.length===0 ) ? t("error_message.required") : ""}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedTemplate(event.target.value) }
                />
                <div className="mt-10 flex justify-end gap-2">
                    <Button
                        variant="danger"
                        outline
                        type="reset"
                        onClick={handleOnclickReset}>
                        {t("sending-manual_page.reset")}
                    </Button>

                    <Button
                        variant="surface"
                        type="submit"
                    >
                        {t("sending-manual_page.send")}
                    </Button>
                </div>
            </div>
            
        </DefaultPageLayout>
    )
};
export default SendingManualPage;
