export type CampaignPlatform =
  | "META"
  | "GOOGLE"
  | "INSTAGRAM"
  | "WHATSAPP"
  | "YOUTUBE"
  | "ORGANIC"
  | "REFERRAL"
  | "QR"
  | "OTHER";

export type CampaignStatus = "ACTIVE" | "PAUSED" | "ENDED";

export interface Campaign {
  id: string;
  name: string;
  platform: CampaignPlatform;
  campaign_code: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}
