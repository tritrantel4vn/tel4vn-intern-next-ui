"use client";

import { apiGetBrands } from "@api/brand";
import { apiGetTemplate } from "@api/template";
import { SMSReview } from "@components/shared/atoms";
import { Button, SelectForm } from "@components/shared/molecules";
import ReceiverInfoTable from "@components/shared/non-shared/ReceiverInfoTable";
import { DefaultPageLayout } from "@components/shared/templates";
import { BrandQueryParams } from "@type/api/brand.type";
import { TemplateQueryParams } from "@type/api/template.type";
import { SelectOption } from "@type/common.type";
import { useTranslations } from "next-intl";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CHANNEL, SENDING_MANUAL_BREADCRUMBS } from "@constants/page/sending_manual-constants";
import { nanoid } from "nanoid";
const SendingManualPage = () => {
	interface TemplateOption extends SelectOption {
		content: string;
	}

	//Hook
	const t = useTranslations();

	//State
	const [brandOptions, setBrandOptions] = useState<SelectOption[]>([]);
	const [brandId, setBrandIDs] = useState<string>("");
	const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
	const [templateContent, setTemplateContent] = useState<string>("");
	const [templateVariables, setTemplateVariables] = useState<string[]>([]);
	const [sendList, setSendList] = useState<Array<Record<string, string> & { _id: string }>>([
		{ _id: nanoid(), phone_number: "" },
	]);

	const handleSelectBrandName = () => {
		const selectedBrand = brandOptions.find((b) => b.value === brandId);
		const selectedBrandName = selectedBrand?.label || "";
		return selectedBrandName;
	};

	/**
	 * handle Get Brands
	 */
	const handleGetBrands = useCallback(async () => {
		try {
			const queryParams: BrandQueryParams = {
				limit: 100,
				offset: 0,
			};

			/**
			 * const response
			 * @param queryParams: BrandQueryParams
			 */
			const response = await apiGetBrands(queryParams);
			if (response.code !== "OK") {
				toast.error(t("api.get.failed", { data: t("sending-manual_page.brand").toLowerCase() }));
			}
			const options = response.data.map((brand) => ({
				value: brand.id,
				label: brand.name,
				noTranslate: true,
			}));

			setBrandOptions(options);
		} catch (error) {
			toast.error(t("api.get.failed", { data: t("sending-manual_page.brand").toLowerCase() }));
		}
	}, []);

	useEffect(() => {
		handleGetBrands();
	},[]);

	/**
	 * Handle Get Templates
	 */
	const handleGetTemplates = async () => {
		try {
			const queryParams: TemplateQueryParams = {
				limit: 100,
				offset: 0,
			};
			/**
			 * const response
			 * @param queryParams: TemplateQueryParams
			 */
			const response = await apiGetTemplate(queryParams);
			if (response.code !== "OK") {
				toast.error(t("api.get.failed", { data: t("sending-manual_page.brand").toLowerCase() }));
			}

			const filtered = response.data.filter((template) => template.brand_id === brandId);
			const options = filtered.map((template) => ({
				noTranslate: true,
				value: template.id,
				label: template.name,
				content: template.content,
			}));
			setTemplateOptions(options);
		} catch (error) {
			toast.error(t("api.get.failed", { data: t("sending-manual_page.brand").toLowerCase() }));
		}
	};

	useEffect(() => {
		if (brandId) {
			handleGetTemplates();
		}
	}, [brandId]);

	/**
	 * Handle On Click Reset
	 */
	const handleOnclickReset = () => {
		setBrandIDs("");
		setSelectedTemplate("");
		setTemplateVariables([]);
	};

	/**
	 * Update Send List
	 * @param key : string
	 * @param index : number
	 * @param value : string
	 */
	const updateSendList = (index: number, key: string, value: string) => {
		const updated = [...sendList];
		updated[index][key] = value;
		setSendList(updated);
	};

	/**
	 * Is Send List Valid
	 * @returns : boolean
	 */
	const isSendListValid = () => {
		const isSendListValid = sendList.every((row) =>
			Object.values(row).every((value) => value.trim() !== "")
		);
		return isSendListValid;
	};

	/**
	 * Handle Get Parsed Content
	 * @returns: string
	 */
	const handleGetParsedContent = () => {
		if (!templateContent) return "";

		let parsed = templateContent;
		templateVariables.forEach((variable) => {
			const rawVariable = `{{${variable}}`;
			const value = sendList[0]?.[variable] || "";
			const regex = new RegExp(`{{\\s*${variable}\\s*}}`, "g");
			parsed = parsed.replace(regex, value !== undefined && value !== "" ? value : rawVariable);
		});
		return parsed;
	};

	/**
	 * Handle On Change Select Brand
	 * @param event ChangeEvent<HTMLSelectElement>
	 */
	const handleOnChangeSelectBrand = (event: ChangeEvent<HTMLSelectElement>) => {
		setBrandIDs(event.target.value);
	};

	/**
	 * Handle On Change Select Template
	 * @param event : ChangeEvent<HTMLSelectElement>
	 */
	const handleOnChangeSelectTemplate = (event: ChangeEvent<HTMLSelectElement>) => {
		const selectedId = event.target.value;
		setSelectedTemplate(selectedId);

		const selected = templateOptions.find(
			(template) => template.value === selectedId
		) as TemplateOption;

		const content = selected?.content || "";
		setTemplateContent(content);

		const variables =
			content.match(/{{(.*?)}}/g)?.map((variable) => variable.replace(/{{|}}/g, "")) || [];
		setTemplateVariables(variables);

		const newRow: Record<string, string> & { _id: string } = { _id: nanoid(), phone: "" };
		variables.forEach((variable) => (newRow[variable] = ""));
		setSendList([newRow]);
	};

    /**
     * 
     * @param e React.FormEvent<HTMLFormElement>
     * @returns 
     */
    const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
	e.preventDefault();

	if (!isSendListValid()) {
		toast.error(t("error_message.invalid_data"));
		return;
	}

	toast.success(t("sending-manual_page.message.success"));

	handleOnclickReset();
};


	return (
		<DefaultPageLayout breadcrumbs={SENDING_MANUAL_BREADCRUMBS}>
			<form className="flex items-start gap-4" onSubmit={handleOnSubmit}>
				<div className="flex w-8/12 flex-col gap-4">
					{/* Area: Select channel */}
					<SelectForm disabled options={CHANNEL} label={"sending-manual_page.channel"} />

					{/* Area: Select Brand */}
					<SelectForm
						value={brandId}
						options={brandOptions}
						label={"sending-manual_page.brand"}
						placeholder={t("select.placeholder", {
							data: t("sending-manual_page.brand").toLowerCase(),
						})}
						onChange={handleOnChangeSelectBrand}
					/>

					{/* Area: Select Template */}
					<SelectForm
						value={selectedTemplate}
						options={templateOptions}
						label={"sending-manual_page.template"}
						placeholder={t("select.placeholder", {
							data: t("sending-manual_page.template").toLowerCase(),
						})}
						errorMessage={brandId && !selectedTemplate ? t("error_message.required") : ""}
						onChange={handleOnChangeSelectTemplate}
					/>

					{/* Area: Receiver Info Table */}
					{selectedTemplate && (
						<ReceiverInfoTable
							required
							sendList={sendList}
							templateVariables={templateVariables}
							label="sending-manual_page.receiver_info"
							setSendList={setSendList}
							updateSendList={updateSendList}
						/>
					)}

					{/* Area: Button */}
					<div className="mt-10 flex justify-end gap-2">
						<Button variant="danger" outline type="reset" onClick={handleOnclickReset}>
							{t("sending-manual_page.reset")}
						</Button>

						<Button type="submit" disabled={!isSendListValid()} >
							{t("sending-manual_page.send")}
						</Button>
					</div>
				</div>
				<div className="w-4/12">
					{/* Area: SMS Review */}
					<SMSReview
						channel="SMS"
						phoneNumber={sendList[0]?.phone}
						branchName={handleSelectBrandName()}
						messageContent={handleGetParsedContent()}
					/>
				</div>
			</form>
		</DefaultPageLayout>
	);
};
export default SendingManualPage;
