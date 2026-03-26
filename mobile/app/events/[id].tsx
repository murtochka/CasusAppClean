import {
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/hooks/useAuth'
import { useEventStore } from '@/store/eventStore'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Button, Card } from '@/components/common'
import { Colors, Spacing, Typography } from '@/constants'
import { useEffect, useState } from 'react'
import { Event } from '@/types/event'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const styles = createStyles(theme)

  const { selectedEvent, fetchEventById } = useEventStore()
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadEvent()
    }
  }, [id])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      await fetchEventById(id!)
    } catch (err: any) {
      console.error('Failed to load event:', err)
      setError(err.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = user && selectedEvent && selectedEvent.businessId === user.id
  const isPublished = selectedEvent?.status === 'published'
  const eventEnded = selectedEvent && new Date(selectedEvent.endDateTime) < new Date()

  const handleEdit = () => {
    if (selectedEvent) {
      router.push(`/events/edit/${selectedEvent.id}`)
    }
  }

  const handleCancel = () => {
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? This action cannot be undone.',
      [
        { text: 'Keep Event', style: 'cancel' },
        {
          text: 'Cancel Event',
          onPress: async () => {
            try {
              setBookingLoading(true)
              // Call cancel event action
              await useEventStore.getState().cancelEvent(selectedEvent!.id)
              Alert.alert('Success', 'Event cancelled', [{ text: 'OK', onPress: () => router.back() }])
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel event')
            } finally {
              setBookingLoading(false)
            }
          },
          style: 'destructive',
        },
      ]
    )
  }

  const handlePublish = () => {
    Alert.alert(
      'Publish Event',
      'Once published, this event will be visible to all users. You can still edit it afterward.',
      [
        { text: 'Keep Draft', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              setBookingLoading(true)
              await useEventStore.getState().publishEvent(selectedEvent!.id)
              Alert.alert('Success', 'Event published!', [
                { text: 'OK', onPress: () => loadEvent() },
              ])
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to publish event')
            } finally {
              setBookingLoading(false)
            }
          },
        },
      ]
    )
  }

  const handleBookEvent = async () => {
    if (!user) {
      Alert.alert('Not Signed In', 'Please sign in to book events')
      return
    }

    try {
      setBookingLoading(true)
      // Navigate to booking screen with event pre-filled
      router.push({
        pathname: '/bookings/create',
        params: { eventId: selectedEvent!.id },
      })
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to proceed with booking')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleShare = async () => {
    if (!selectedEvent) return

    try {
      const message = `Check out this event: ${selectedEvent.title}\n${selectedEvent.description}\n\nDate: ${formatDate(selectedEvent.startDateTime)} at ${formatTime(selectedEvent.startDateTime)}\nLocation: ${selectedEvent.address}, ${selectedEvent.city}`

      await Share.share({
        message,
        title: selectedEvent.title,
      })
    } catch (err) {
      console.error('Failed to share:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getDaysUntilEvent = () => {
    if (!selectedEvent) return 0
    const now = new Date()
    const eventDate = new Date(selectedEvent.startDateTime)
    const diff = eventDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  if (error || !selectedEvent) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.grayText} />
            <Text style={styles.errorText}>{error || 'Event not found'}</Text>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  const daysUntil = getDaysUntilEvent()
  const capacityPercentage = selectedEvent.maxAttendees
    ? (selectedEvent.currentAttendees / selectedEvent.maxAttendees) * 100
    : 0

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerButton}
              disabled={!isPublished}
            >
              <Ionicons
                name="share-social-outline"
                size={24}
                color={isPublished ? theme.primary : theme.grayText}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Cover Image */}
          <View style={styles.imageContainer}>
            {selectedEvent.coverImageUrl ? (
              <Image
                source={{ uri: selectedEvent.coverImageUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.coverImage, styles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={48} color={theme.grayText} />
              </View>
            )}

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(selectedEvent.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {selectedEvent.status.toUpperCase()}
              </Text>
            </View>

            {/* Days Until Event */}
            {!eventEnded && daysUntil >= 0 && (
              <View style={[styles.daysUntilBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.daysUntilText}>
                  {daysUntil === 0 ? 'TODAY' : `${daysUntil}d away`}
                </Text>
              </View>
            )}
          </View>

          {/* Title and Location */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.text }]}>{selectedEvent.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={theme.grayText} />
              <Text style={[styles.locationText, { color: theme.grayText }]}>
                {selectedEvent.address}, {selectedEvent.city}
              </Text>
            </View>
          </View>

          {/* Key Info Cards */}
          <View style={styles.infoCards}>
            {/* Date & Time */}
            <Card style={[styles.infoCard, { backgroundColor: theme.surface }]}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                <Text style={[styles.infoCardLabel, { color: theme.grayText }]}>
                  Date & Time
                </Text>
              </View>
              <Text style={[styles.infoCardValue, { color: theme.text }]}>
                {formatDate(selectedEvent.startDateTime)}
              </Text>
              <Text style={[styles.infoCardValue, { color: theme.text }]}>
                {formatTime(selectedEvent.startDateTime)} - {formatTime(selectedEvent.endDateTime)}
              </Text>
            </Card>

            {/* Attendees */}
            <Card style={[styles.infoCard, { backgroundColor: theme.surface }]}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="people-outline" size={20} color={theme.primary} />
                <Text style={[styles.infoCardLabel, { color: theme.grayText }]}>
                  Attendees
                </Text>
              </View>
              <Text style={[styles.infoCardValue, { color: theme.text }]}>
                {selectedEvent.currentAttendees}
                {selectedEvent.maxAttendees ? `/${selectedEvent.maxAttendees}` : '+'}
              </Text>
              {selectedEvent.maxAttendees && (
                <View style={styles.capacityBar}>
                  <View
                    style={[
                      styles.capacityFill,
                      {
                        width: `${Math.min(capacityPercentage, 100)}%`,
                        backgroundColor:
                          capacityPercentage > 80 ? Colors.error : theme.primary,
                      },
                    ]}
                  />
                </View>
              )}
            </Card>

            {/* Price */}
            {selectedEvent.pricePerPerson > 0 && (
              <Card style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                <View style={styles.infoCardHeader}>
                  <Ionicons name="pricetag-outline" size={20} color={theme.primary} />
                  <Text style={[styles.infoCardLabel, { color: theme.grayText }]}>
                    Price
                  </Text>
                </View>
                <Text style={[styles.infoCardValue, { color: theme.text }]}>
                  ${selectedEvent.pricePerPerson.toFixed(2)} per person
                </Text>
              </Card>
            )}
          </View>

          {/* Tags */}
          {selectedEvent.tags && selectedEvent.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Tags</Text>
              <View style={styles.tagsList}>
                {selectedEvent.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[styles.tag, { backgroundColor: theme.primary + '20' }]}
                  >
                    <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About this event</Text>
            <Text style={[styles.description, { color: theme.text }]}>
              {selectedEvent.description}
            </Text>
          </View>

          {/* Recurring Info */}
          {selectedEvent.isRecurring && (
            <Card style={[styles.recurringCard, { backgroundColor: theme.surface }]}>
              <Ionicons name="repeat-outline" size={20} color={theme.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[styles.recurringLabel, { color: theme.text }]}>
                  Recurring Event
                </Text>
                <Text style={[styles.recurringSubtext, { color: theme.grayText }]}>
                  This event repeats {selectedEvent.recurrencePattern?.type}
                </Text>
              </View>
            </Card>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          {isOwner ? (
            <>
              {selectedEvent.status === 'draft' && (
                <Button
                  title="Publish Event"
                  onPress={handlePublish}
                  disabled={bookingLoading}
                  loading={bookingLoading}
                  icon={<Ionicons name="cloud-upload-outline" size={20} color="#fff" />}
                />
              )}
              <View style={styles.buttonRow}>
                <Button
                  title="Edit"
                  variant="secondary"
                  onPress={handleEdit}
                  disabled={bookingLoading}
                  icon={<Ionicons name="pencil-outline" size={20} color={theme.primary} />}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={handleCancel}
                  disabled={bookingLoading}
                  icon={<Ionicons name="close-circle-outline" size={20} color={Colors.error} />}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            <>
              {isPublished && !eventEnded && (
                <Button
                  title="Book Event"
                  onPress={handleBookEvent}
                  disabled={bookingLoading}
                  loading={bookingLoading}
                  icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
                />
              )}
              {eventEnded && (
                <Text style={[styles.eventEndedText, { color: theme.grayText }]}>
                  This event has ended
                </Text>
              )}
              {!isPublished && (
                <Text style={[styles.eventEndedText, { color: theme.grayText }]}>
                  This event is not yet published
                </Text>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return '#FFA500' // Orange
    case 'published':
      return '#4CAF50' // Green
    case 'cancelled':
      return '#F44336' // Red
    case 'completed':
      return '#2196F3' // Blue
    default:
      return '#999'
  }
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerButton: {
      padding: Spacing.sm,
    },
    headerRight: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    errorText: {
      fontSize: Typography.fontSize.body,
      color: theme.grayText,
      marginVertical: Spacing.lg,
      textAlign: 'center',
    },
    content: {
      paddingBottom: 120,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 250,
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBadge: {
      position: 'absolute',
      top: Spacing.lg,
      left: Spacing.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
    },
    statusBadgeText: {
      color: '#fff',
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
    },
    daysUntilBadge: {
      position: 'absolute',
      bottom: Spacing.lg,
      right: Spacing.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
    },
    daysUntilText: {
      color: '#fff',
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
    },
    titleSection: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: Typography.fontSize.title,
      fontWeight: '600',
      marginBottom: Spacing.md,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    locationText: {
      fontSize: Typography.fontSize.body,
    },
    infoCards: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      gap: Spacing.md,
    },
    infoCard: {
      borderRadius: 12,
      padding: Spacing.md,
    },
    infoCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    infoCardLabel: {
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
    },
    infoCardValue: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    capacityBar: {
      height: 4,
      backgroundColor: theme.border,
      borderRadius: 2,
      marginTop: Spacing.sm,
      overflow: 'hidden',
    },
    capacityFill: {
      height: '100%',
      borderRadius: 2,
    },
    tagsSection: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      marginBottom: Spacing.md,
    },
    tagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    tag: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
    },
    tagText: {
      fontSize: Typography.fontSize.small,
      fontWeight: '500',
    },
    descriptionSection: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    description: {
      fontSize: Typography.fontSize.body,
      lineHeight: 24,
    },
    recurringCard: {
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderRadius: 12,
    },
    recurringLabel: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    recurringSubtext: {
      fontSize: Typography.fontSize.small,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.md,
    },
    eventEndedText: {
      fontSize: Typography.fontSize.body,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  })
