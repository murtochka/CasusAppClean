export interface Favorite {
  id: string
  userId: string
  activityId: string
  createdAt: string
}

export interface AddFavoriteRequest {
  activityId: string
}
