import { NavigatorScreenParams } from '@react-navigation/native'

export type RootStackParamList = {
  '(auth)': NavigatorScreenParams<AuthStackParamList>
  '(tabs)': NavigatorScreenParams<TabsParamList>
  'activity/[id]': { id: string }
  'booking/[activityId]': { activityId: string }
  'booking/detail/[id]': { id: string }
  'booking/payment/[bookingId]': { bookingId: string }
  'booking/confirmation': { bookingId: string }
  'review/create/[bookingId]': { bookingId: string }
  'profile/edit': undefined
  'guide/dashboard': undefined
  'guide/activity/[id]': { id: string }
  'guide/availability/[activityId]': { activityId: string }
  'guide/bookings': undefined
  'guide/profile/index': undefined
  'guide/profile/edit': undefined
  'guide/profile/view/[guideId]': { guideId: string }
  'profile/reviews': undefined
  'settings': undefined
  'about': undefined
  'help': undefined
}

export type AuthStackParamList = {
  login: undefined
  register: undefined
}

export type TabsParamList = {
  search: undefined
  bookings: undefined
  favorites: undefined
  profile: undefined
  'guide-dashboard': undefined
}
