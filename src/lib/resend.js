import { Resend } from "resend";
import { FROM_EMAIL_ADDRESS } from "./siteConfig";

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const FROM_EMAIL = `InstaPadel <${FROM_EMAIL_ADDRESS}>`;