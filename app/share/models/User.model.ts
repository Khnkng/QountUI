/**
 * Created by seshu on 10-03-2016.
 */

export interface UserModel {
  id: string
  firstName: string
  lastName: string
  name: string
  phoneNumber: string
  active: boolean
  groups: [string]
  group_invitations: [string]
}
