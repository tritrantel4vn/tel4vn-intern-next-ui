'use client';

import { MessageTailDark, MessageTailLight, PhoneMessage, SMSPreviewLight, SMSPreviewLightDark, ZNSPreviewDark, ZNSPreviewLight } from "@/public/images";
import { ZOA } from "@/public/svg";
import parse from "html-react-parser";
import { LucideChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export interface SMSReviewProps {
	channel: "SMS" | "ZNS";
	brandName?: string;
	phoneNumber?: string;
	messageContent?: string;
	variables?: Record<string, string>; // Giá trị để thay vào template
}

/**
 * Thay thế {{variable}} bằng giá trị từ biến
 */
const renderMessageContent = (template?: string, variables: Record<string, string> = {}) => {
	if (!template) return "";
	return template.replace(/{{(.*?)}}/g, (_, key) => variables[key.trim()] || "");
};

const SMSReview = ({
	channel,
	brandName = "",
	phoneNumber = "",
	messageContent = "",
	variables = {}
}: SMSReviewProps) => {
	const t = useTranslations();
	const finalContent = renderMessageContent(messageContent, variables);

	return (
		<div className="relative mx-auto py-1">
			{channel === "SMS" ? (
				<>
					<Image priority alt="sms-preview" className="dark:hidden" src={SMSPreviewLight} />
					<Image priority alt="sms-preview" className="hidden dark:block" src={SMSPreviewLightDark} />

					{brandName && (
						<div className="absolute left-0 top-[117px] w-full text-center text-sm font-semibold">
							{brandName}
						</div>
					)}

					{finalContent && (
						<div className="absolute left-0 top-48 ml-5 mr-20 rounded-2xl bg-surface-500 dark:bg-surface-800">
							<div className="relative px-3 py-2 text-base">{parse(finalContent)}</div>
							<Image alt="message-tail" src={MessageTailLight} className="absolute -bottom-[1px] -left-[5px] dark:hidden" />
							<Image alt="message-tail" src={MessageTailDark} className="absolute -bottom-[1px] -left-[5px] hidden dark:block" />
						</div>
					)}
				</>
			) : (
				<>
					<Image priority alt="zns-preview" className="dark:hidden" src={ZNSPreviewLight} />
					<Image priority alt="zns-preview" className="hidden dark:block" src={ZNSPreviewDark} />
					{/* Icon avatar người */}
					<div className="absolute left-1/2 top-[80px] -translate-x-1/2">
						<Image src={ZOA} alt="avatar" />
					</div>

					{/* Brand name dưới avatar */}
					{brandName && (
						<div className="absolute left-1/2 top-[122px] -translate-x-1/2 text-center text-white text-sm font-semibold max-w-[180px] truncate">
							{brandName}
						</div>
					)}

					{/* Tài khoản ZNS dưới tên brand */}
					<div className="absolute left-1/2 top-[142px] -translate-x-1/2 text-xs text-white font-normal">
						{t("zns_preview.account")}
					</div>

					<div className="absolute left-1 top-[180px]">
						<div className="scrollbar-hide flex h-[630px] w-[392px] flex-col items-center gap-2 overflow-y-auto bg-slate-200">
							<div className="mt-10 flex w-[352px] justify-center rounded-xl bg-white px-1 py-3 dark:bg-surface-800">
								<Image src={PhoneMessage} alt="phone" width={30} />
								<div className="flex w-full flex-col gap-1 ps-1">
									<div>
										<span className="font-bold">{brandName}</span>{" "}
										<span>{t("zns_preview.message")}</span>
									</div>
									<span className="text-ellipsis font-bold">{phoneNumber}</span>
								</div>
								<div className="mx-0 my-auto flex-none text-center">
									<LucideChevronRight />
								</div>
							</div>

							{finalContent && (
								<div className="mb-10 flex w-[352px] flex-col rounded-xl bg-white py-3 dark:bg-surface-800">
									<div className="px-3">{parse(finalContent)}</div>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default SMSReview;
