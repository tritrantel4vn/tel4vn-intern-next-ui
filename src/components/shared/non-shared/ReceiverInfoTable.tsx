"use client";

import { InputForm, Button } from "@components/shared/molecules";
import { CirclePlus, Trash2, AlignJustify, Asterisk } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { ChangeEvent } from "react";
import { nanoid } from "nanoid";

interface ReceiverInfoTableProps {
	label?: string;
	required?: boolean;
	templateVariables: string[];
	sendList: Array<Record<string, string> & { _id: string }>;
	updateSendList: (index: number, key: string, value: string) => void;
	setSendList: React.Dispatch<
		React.SetStateAction<Array<Record<string, string> & { _id: string }>>
	>;
}

const ReceiverInfoTable: React.FC<ReceiverInfoTableProps> = ({
	sendList,
	required = false,
	templateVariables,
	label = "sending-manual_page.receiver_info",
	setSendList,
	updateSendList,
}) => {
	//Hooks
	const t = useTranslations();

	/**
	 * Handle Add Row
	 */
	const handleAddRow = () => {
		const newRow: Record<string, string> & { _id: string } = {
			_id: nanoid(),
			phone: "",
			...Object.fromEntries(templateVariables.map((v) => [v, ""])),
		};

		setSendList([...sendList, newRow]);
	};

	/**
	 * Handle Delete Row
	 * @param rowIndex
	 */
	const handleDeleteRow = (rowIndex: number) => {
		if (sendList.length > 1) {
			setSendList(sendList.filter((_, index) => index !== rowIndex));
		}
	};

	/**
	 *
	 * @param rowIndex number
	 */
	const handleOnChangePhoneNumber =
		(rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
			updateSendList(rowIndex, "phone", event.target.value);
		};

	return (
		<div className="flex flex-col gap-2">
			<div className="mb-2 flex justify-between gap-2">
				{/** Area: Label */}
				<label className="flex whitespace-nowrap text-base font-semibold">
					{t(label)} {required && <Asterisk size={12} className="ml-1 text-danger-500" />}
				</label>
			</div>
			{/** Area: Table */}
			<table className="w-full table-auto text-left text-sm">
				<thead>
					<tr>
						<th className="border-b border-r border-gray-300 p-2 py-1 text-center">
							{t("sending-manual_page.phone_number")}
						</th>
						{templateVariables.map((templateVariable) => (
							<th
								key={templateVariable}
								className="border-b border-r border-gray-300 p-2 py-1 text-center"
							>
								{templateVariable}
							</th>
						))}
						<th className="border-b border-gray-300 p-2 text-center">
							<AlignJustify className="mx-auto" size={16} strokeWidth={2.5} />
						</th>
					</tr>
				</thead>

				{/** Area: Body Table */}
				<tbody>
					{sendList.map((row, rowIndex) => (
						<tr key={row._id}>
							<td className="border-b border-r border-gray-300 p-2 py-1 text-center">
								{/** Area: Input Phone Number */}
								<InputForm
									state="transparent"
									value={row.phone}
									onChange={handleOnChangePhoneNumber(rowIndex)}
									placeholder={t("input.placeholder", { data: "phone_number" })}
								/>
							</td>

							{/** Area: Input Variables */}
							{templateVariables.map((templateVariable) => (
								<td
									key={templateVariable}
									className="w-fit border-b border-r border-gray-300 p-2 py-1 text-center"
								>
									<InputForm
										state="transparent"
										value={row[templateVariable] || ""}
										placeholder={t("input.placeholder", { data: templateVariable })}
										onChange={(e) => updateSendList(rowIndex, templateVariable, e.target.value)}
									/>
								</td>
							))}
							<td className="border-b border-gray-300 p-2 py-1 text-center">
								<Button
									outline
									size="sm"
									variant="danger"
									disabled={sendList.length === 1}
									onClick={() => handleDeleteRow(rowIndex)}
								>
									<Trash2 size={16} strokeWidth={2.5} />
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{/** Area: Add Row Button */}
			<div className="w-4/12">
				<Button className="mt-3" variant="primary" onClick={handleAddRow}>
					<CirclePlus size={16} />
					{t("sending-manual_page.button.add")}
				</Button>
			</div>
		</div>
	);
};

export default ReceiverInfoTable;
