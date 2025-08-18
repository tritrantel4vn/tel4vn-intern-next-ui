"use client";

import { apiGetBrands } from "@api/brand";
import { TextArea } from "@components/shared/atoms";
import { InputForm, Modal, SelectForm } from "@components/shared/molecules";
import { BrandQueryParams } from "@type/api/brand.type";
import { TemplateBody } from "@type/api/template.type";
import { SelectOption } from "@type/common.type";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { object, string } from "yup";

export interface AddTemplateModalProps {
	isOpen: boolean;
	isEdit: boolean;
	brand: string;
	templateName: string;
	templateContent: string;
	setIsOpen: (value: boolean) => void;
	onSubmit: (body: TemplateBody) => Promise<any>;
}

/**
 * Add Template Modal Component
 * @props AddTemplateModalProps
 */
const AddTemplateModal = ({
	isOpen,
	setIsOpen,
	isEdit,
	brand,
	templateName,
	templateContent,
	onSubmit,
}: AddTemplateModalProps) => {
	//Hooks
	const t = useTranslations();

	// States
	const [brandOptions, setBrandOptions] = useState<SelectOption[]>([]);

	const initialValues = useMemo(() => {
		return {
			brand_id: brand,
			name: templateName,
			content: templateContent,
			isEdit: isEdit,
		};
	}, [brand, templateName, templateContent, isEdit]);

	const validationSchema = useMemo(() => {
		return object().shape({
			name: string()
				.min(2, t("error_message.min_length", { data: 2 }))
				.required(t("error_message.required")),

			content: string()
				.min(2, t("error_message.min_length", { data: 2 }))
				.required(t("error_message.required")),
			brand: string(),
		});
	}, []);

	const formik = useFormik({
		initialValues,
		validationSchema,
		enableReinitialize: true,
		onSubmit: async (values) => {
			await onSubmit(values);
		},
	});

	/**
	 * Handle get brands
	 */
	const handleGetBrands = useCallback(async () => {
		try {
			const queryParams: BrandQueryParams = {
				limit: 9999,
				offset: 0,
			};

			const response = await apiGetBrands(queryParams);

			if (response.code !== "OK") {
				toast.error(t("api.get.failed", { data: t("templates_page.brand").toLowerCase() }));
				return;
			}

			const options = response.data.map((brand) => ({
				noTranslate: true,
				label: brand.name,
				value: brand.id,
			}));

			setBrandOptions(options);
		} catch (error) {
			toast.error(t("api.get.failed", { data: t("templates_page.brand").toLowerCase() }));
		}
	}, []);

	useEffect(() => {
		handleGetBrands();
	}, []);

	return (
		<Modal
			size="md"
			isOpen={isOpen}
			confirmLabel={t("form.save")}
			confirmClassName="bg-secondary-500"
			title={t("templates_page.add_template_modal.title")}
			setIsOpen={setIsOpen}
			onCancel={formik.handleReset}
			onConfirm={formik.handleSubmit}
		>
			<form className="flex flex-col gap-4">
				{/* Area: Brand Selection */}
				<SelectForm
					id="brand_id"
					name="brand_id"
					options={brandOptions}
					label="brands_page.title"
					placeholder={t("select.placeholder", { data: t("brands_page.title").toLowerCase() })}
					value={formik.values.brand_id}
					onChange={formik.handleChange}
				/>

				{/* Area: Tempate Name */}
				<InputForm
					id="name"
					name="name"
					noTranslateLabel
					value={formik.values.name}
					label={t("templates_page.name")}
					errorMessage={formik.errors.name}
					placeholder={t("input.placeholder", { data: t("templates_page.name").toLowerCase() })}
					onChange={formik.handleChange}
				/>

				{/* Area: Template Content */}
				<TextArea
					id="content"
					name="content"
					label="templates_page.content"
					placeholder={t("input.placeholder", { data: t("templates_page.content").toLowerCase() })}
					value={formik.values.content}
					errorMessage={formik.errors.content}
					onChange={formik.handleChange}
				/>
			</form>
		</Modal>
	);
};
export default AddTemplateModal;
