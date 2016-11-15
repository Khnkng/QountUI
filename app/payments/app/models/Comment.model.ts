
export interface CommentModel {
  cardId: string
  mentions_id: string[]
  mentions_name: string[]
  comment: string
  dateTime?:number
  userId?:string
  user?:string
  hash?:string
  sourceID:string
}
