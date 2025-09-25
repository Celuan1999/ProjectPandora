import { Session } from '@supabase/supabase-js'
import { OrgUser } from './api'

// Extended session type that includes additional user data from database
export type AuthSession = Session & {
  userData?: OrgUser
}