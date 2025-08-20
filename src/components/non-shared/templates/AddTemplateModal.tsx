"use client";

import { TextArea } from "@components/shared/atoms";
import { InputForm, Modal, SelectForm } from "@components/shared/molecules";
import { Template, TemplateBody } from "@type/api/template.type";
import { apiGetBrands } from "@api/brand";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { object, string } from "yup";
import { Brand } from "@type/api/brand.type";

export interface AddTemplateModalProps {
	isOpen: boolean;
	template: Template;
	setIsOpen: (value: boolean) => void;
	onSubmit: (body: TemplateBody) => Promise<void>;
}

/**
 * Add Template Modal
 * @props AddTemplateModalProps
 */
const AddTemplateModal = ({ isOpen, template, setIsOpen, onSubmit }: AddTemplateModalProps) => {
	//State
	const [brandOptions, setBrandOptions] = useState<{ label: string; value: string }[]>([]);
	// Hooks
	const t = useTranslations();

	//get brands list

	useEffect(() => {
		const fetchBrands = async () => {
			try {
				const res = await apiGetBrands({ limit: 100, offset: 0 });
				if (res.code === "OK") {
					const options = res.data.map((b: Brand) => ({
						label: b.name,
						value: b.id,
						noTranslate: true,
					}));
					setBrandOptions(options);
				}
			} catch (error) {
				console.error("Failed to fetch brands:", error);
			}
		};

		if (isOpen) {
			fetchBrands();
		}
	}, [isOpen]);

	// Memoized
	const initialValues = useMemo(() => {
		return {
			brand: template.brand,
			name: template.name,
			content: template.content,
		};
	}, [template]);

	const validationSchema = useMemo(() => {
		return object().shape({
			name: string()
				.min(2, t("error_message.min_length", { data: 2 }))
				.max(50, t("error_message.max_length", { data: 50 }))
				.required(t("error_message.required")),
			description: string().max(200, t("error_message.max_length", { data: 200 })),
			channel: string().oneOf(["sms", "zns", "email"], t("error_message.invalid_value")),
		});
	}, []);

	// Formik
	const formik = useFormik({
		initialValues,
		validationSchema,
		enableReinitialize: true,
		onSubmit: async (values) => {
			await onSubmit(values as TemplateBody);
		},
	});

	return (
		<Modal
			size="md"
			isOpen={isOpen}
			confirmLabel={t("form.save")}
			confirmClassName="bg-secondary-500"
			title={t("templates_page.add_template_modal.title")}
			setIsOpen={setIsOpen}
			onConfirm={formik.handleSubmit}
			onCancel={formik.handleReset}
		>
			<form className="flex flex-col gap-4">
				{/* Area: Brand Name */}
				<SelectForm
					size="sm"
					id="brand"
					name="brand"
					label="templates_page.brand"
					placeholder={t("select.placeholder", { data: t("templates_page.brand").toLowerCase() })}
					options={brandOptions}
					value={formik.values.brand}
					errorMessage={formik.errors.content}
					onChange={formik.handleChange}
				/>

				{/* Area: Description */}
				<InputForm
					size="sm"
					id="name"
					name="name"
					label="templates_page.name"
					placeholder={t("input.placeholder", { data: t("templates_page.name").toLowerCase() })}
					value={formik.values.content}
					errorMessage={formik.errors.content}
					onChange={formik.handleChange}
				/>

				{/* Area: Channel */}
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
