'use client';

import { BreadcrumbItem } from "@components/shared/atoms/Breadcrumb";
import { Button, InputForm, SelectForm } from "@components/shared/molecules";
import { DefaultPageLayout } from "@components/shared/templates";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify"
import { ChangeEvent, useEffect, useState } from "react";
import { BrandQueryParams } from "@type/api/brand.type";
import { apiGetBrands } from "@api/brand";
import { apiGetTemplate } from "@api/template";
import RecieverInforTable from "@components/shared/non-shared/RecieverInforTable";
import { SMSReview } from "@components/shared/atoms";

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
    const [brandId, setBrandIDs] = useState<string>("");
    const [templates, setTemplates] = useState<{ label: string; value: string; content: string }[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [templateContent, setTemplateContent] = useState<string>("");
    const [templateVariables, setTemplateVariables] = useState<string[]>([]);
    const [sendList, setSendList] = useState<Array<Record<string, string>>>([
        { phone_number: "" }
    ]);
    const selectedBrand = brands.find(b => b.value === brandId);
    const selectedBrandName = selectedBrand?.label || "";


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
                const filtered = response.data.filter((temp) => (temp.brand_id === brandId))
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
        if (brandId) {
            fetchTemplate();
        }
    }, [brandId]);

    const handleOnclickReset = (() => {
        setBrandIDs("");
        setSelectedTemplate("");
        setTemplateVariables([]);
    })
    const updateSendList = (index: number, key: string, value: string) => {
        const updated = [...sendList];
        updated[index][key] = value;
        setSendList(updated);
    };

    const isSendListValid = () => {
        return sendList.every(row =>
            Object.values(row).every(value => value.trim() !== "")
        );
    };

    const getParsedContent = () => {
    if (!templateContent) return "";

    let parsed = templateContent;
    templateVariables.forEach(variable => {
        const value = sendList[0]?.[variable] || "";
        const rawVariable = `{{${variable}}`
        const regex = new RegExp(`{{\\s*${variable}\\s*}}`, "g");
        parsed = parsed.replace(regex, value !== undefined && value!== ""? value : rawVariable);
    });

    return parsed;
};


    return (
        <DefaultPageLayout breadcrumbs={SENDING_MANUAL_BREADCRUMBS}>
            <form className="flex items-start gap-4">
                <div className=" flex w-8/12 flex-col gap-4">
                    <SelectForm
                        disabled
                        options={channel}
                        label={"sending-manual_page.channel"}
                    />

                    <SelectForm
                        options={brands}
                        label={"sending-manual_page.brand"}
                        value={brandId}
                        placeholder={t("select.placeholder", { data: t("sending-manual_page.brand").toLowerCase() })}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) => setBrandIDs(event.target.value)}
                    />

                    <SelectForm
                        options={templates}
                        label={"sending-manual_page.template"}
                        value={selectedTemplate}
                        placeholder={t("select.placeholder", { data: t("sending-manual_page.template").toLowerCase() })}
                        errorMessage={(brandId.length > 0 && selectedTemplate.length === 0) ? t("error_message.required") : ""}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                            const selectedId = event.target.value;
                            setSelectedTemplate(selectedId);

                            const selected = templates.find(t => t.value === selectedId);
                            const content = selected?.content || "";
                            setTemplateContent(content);

                            // Extract variables from template
                            const variables = content.match(/{{(.*?)}}/g)?.map(v => v.replace(/{{|}}/g, "")) || [];
                            setTemplateVariables(variables);

                            // Init sendList with 1 row
                            const newRow: Record<string, string> = { phone: "" };
                            variables.forEach((v) => newRow[v] = "");
                            setSendList([newRow]);
                        }}

                    />
                    <RecieverInforTable
                        required
                        label="sending-manual_page.reciever_infor"
                        templateVariables={templateVariables}
                        sendList={sendList}
                        updateSendList={updateSendList}
                        setSendList={setSendList}
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
                            type="submit"
                            disabled={!isSendListValid()}
                        >
                            {t("sending-manual_page.send")}
                        </Button>
                    </div>
                </div>
                <div className="w-4/12">
                    <SMSReview
                        channel="SMS"
                        brandName={selectedBrandName}
                        messageContent={getParsedContent()}
                        phoneNumber={sendList[0]?.phone} />
                </div>
            </form>

        </DefaultPageLayout>
    )
};
export default SendingManualPage;
