'use client';

import { InputForm, Button } from "@components/shared/molecules";
import { CirclePlus, Trash2, AlignJustify, Asterisk } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface RecieverInforTableProps {
    label?: string;
    required?: boolean;
    templateVariables: string[];
    sendList: Array<Record<string, string>>;
    updateSendList: (index: number, key: string, value: string) => void;
    setSendList: React.Dispatch<React.SetStateAction<Array<Record<string, string>>>>;
}

const RecieverInforTable: React.FC<RecieverInforTableProps> = ({
    label = "sending-manual_page.reciever_infor",
    required = false,
    templateVariables,
    sendList,
    updateSendList,
    setSendList
}) => {
    const t = useTranslations();

    const handleAddRow = () => {
        const newRow: Record<string, string> = { phone: "" };
        templateVariables.forEach((v) => newRow[v] = "");
        setSendList([...sendList, newRow]);
    };

    const handleDeleteRow = (idx: number) => {
        if (sendList.length > 1) {
            setSendList(sendList.filter((_, i) => i !== idx));
        }
    };

    if (templateVariables.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between gap-2 mb-2">
                <label className="flex whitespace-nowrap text-base font-semibold">
                    {t(label)}{" "}
                    {required && <Asterisk size={12} className="text-danger-500 ml-1" />}
                </label>
            </div>

            <table className="table-auto w-full text-left text-sm">
                <thead>
                    <tr>
                        <th className="border-r border-b p-2 border-gray-300 py-1 text-center">{t("sending-manual_page.phone_number")}</th>
                        {templateVariables.map(v => (
                            <th key={v} className="border-r border-b p-2 border-gray-300 py-1 text-center">{v}</th>
                        ))}
                        <th className="border-b p-2 border-gray-300 text-center">
                            <AlignJustify className="mx-auto" size={16} strokeWidth={2.5} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sendList.map((row, idx) => (
                        <tr key={idx}>
                            <td className="border-r border-b p-2 border-gray-300 py-1 text-center">
                                <InputForm
                                    state="transparent"
                                    value={row.phone}
                                    onChange={(e) => updateSendList(idx, "phone", e.target.value)}
                                    placeholder={t("input.placeholder", { data: "phone_number" })}
                                />
                            </td>
                            {templateVariables.map(v => (
                                <td key={v} className="border-r border-b p-2 border-gray-300 py-1 w-fit text-center">
                                    <InputForm
                                        state="transparent"
                                        value={row[v] || ""}
                                        onChange={(e) => updateSendList(idx, v, e.target.value)}
                                        placeholder={t("input.placeholder", { data: v })}
                                    />
                                </td>
                            ))}
                            <td className="border-b p-2 border-gray-300 py-1 text-center">
                                <Button
                                    variant="danger"
                                    outline
                                    size="sm"
                                    disabled={sendList.length === 1}
                                    onClick={() => handleDeleteRow(idx)}
                                >
                                    <Trash2 size={16} strokeWidth={2.5} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="w-4/12">
             <Button className="mt-3" variant="primary" onClick={handleAddRow}>
                <CirclePlus size={16} />
                {t("sending-manual_page.button.add")}
            </Button>
            </div>
        </div>
    );
};

export default RecieverInforTable;
