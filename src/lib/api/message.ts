import { ApiResponse } from "@type/api.type";
import { apiPost } from "@utils/config-api";

const SUB_PATH = "/sns/messages";

/**
 * Body type 
 */
export interface SendMessageBody {
  destinations: Array<{
    list_param: Record<string, string>; 
    phone_number: string;
  }>;
  template_id: string;
}

/**
 * Api send message
 * @param body SendMessageBody
 * @returns ApiResponse<null>
 */
export const apiSendMessage = async (body: SendMessageBody) => {
  return await apiPost<ApiResponse<null>>({
    body: JSON.stringify(body),
    token: "",
    url: SUB_PATH,
  });
};
