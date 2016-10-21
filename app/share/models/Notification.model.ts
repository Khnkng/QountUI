/**
 * Created by Mateen on 23-04-2016.
 */


export interface NotificationModel {
  user_id?: string
  notification_id?: string
  notification_date?: string
  notification_text?: string
  notification_type?: string
  read?: boolean
  source_id?: string
}
