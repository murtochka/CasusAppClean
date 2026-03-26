import { StyleSheet, Text, useColorScheme, View, ScrollView, RefreshControl, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card } from '@/components/common'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Colors, Spacing, Typography } from '@/constants'
import { useEffect, useState } from 'react'
import { useEventStore } from '@/store/eventStore'
import { Ionicons } from '@expo/vector-icons'
import { Event } from '@/types/event'

type EventTab = 'active' | 'drafts' | 'past'

export default function MyEventsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const { myEvents, myEventsLoading, myEventsError, fetchMyEvents } = useEventStore()
  const [activeTab, setActiveTab] = useState<EventTab>('active')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.role === 'guide') {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    try {
      await fetchMyEvents({ status: activeTab === 'active' ? 'published' : activeTab })
    } catch (err) {
      console.error('Failed to load events:', err)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadEvents()
    } finally {
      setRefreshing(false)
    }
  }

  const filteredEvents = myEvents.filter(event => {
    if (activeTab === 'active') {
      return event.status === 'published' && new Date(event.endDateTime) > new Date()
    } else if (activeTab === 'drafts') {
      return event.status === 'draft'
    } else {
      // past
      return new Date(event.endDateTime) <= new Date()
    }
  })

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/edit/${eventId}`)
  }

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleDuplicateEvent = async (eventId: string) => {
    try {
      const duplicated = await useEventStore.getState().duplicateEvent(eventId)
      router.push(`/events/edit/${duplicated.id}`)
    } catch (err: any) {
      alert('Failed to duplicate event: ' + (err.message || 'Unknown error'))
    }
  }

  const handleCancelEvent = (eventId: string) => {
    // Implementation for canceling event
  }

  if (user?.role !== 'guide') {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.center, { backgroundColor: theme.background }]}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              This section is for business users only
            </Text>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: Colors.primary }]}>My Events</Text>
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
            {(['active', 'drafts', 'past'] as EventTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && [styles.activeTab, { borderBottomColor: Colors.primary }],
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? Colors.primary : theme.textSecondary },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {myEventsLoading && !myEvents.length ? (
            <View style={[styles.center, { flex: 1 }]}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : myEventsError ? (
            <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
              <Text style={[styles.errorText, { color: Colors.error }]}>{myEventsError}</Text>
              <Button onPress={onRefresh} style={{ marginTop: Spacing.md }}>
                Retry
              </Button>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
              <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {activeTab === 'drafts' ? 'No draft events yet' : `No ${activeTab} events`}
              </Text>
              {activeTab === 'drafts' && (
                <Button
                  onPress={() => router.push('/events/create')}
                  style={{ marginTop: Spacing.md }}
                >
                  Create Event
                </Button>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleViewEvent(item.id)}
                >
                  <EventCard
                    event={item}
                    theme={theme}
                    onEdit={() => handleEditEvent(item.id)}
                    onDuplicate={() => handleDuplicateEvent(item.id)}
                    onCancel={() => handleCancelEvent(item.id)}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
              }
            />
          )}
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: Colors.primary }]}
          onPress={() => router.push('/events/create')}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

/**
 * Event Card Component
 */
function EventCard({
  event,
  theme,
  onEdit,
  onDuplicate,
  onCancel,
}: {
  event: Event
  theme: any
  onEdit: () => void
  onDuplicate: () => void
  onCancel: () => void
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return Colors.warning
      case 'published':
        return Colors.success
      case 'cancelled':
        return Colors.error
      default:
        return theme.textSecondary
    }
  }

  return (
    <Card style={[styles.eventCard, { backgroundColor: theme.card }]}>
      {event.coverImageUrl && (
        <View style={styles.eventImage}>
          {/* Image would be rendered here */}
          <View style={[styles.imageBackground, { backgroundColor: theme.border }]}>
            <Ionicons name="image-outline" size={32} color={theme.textSecondary} />
          </View>
        </View>
      )}

      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={[styles.eventLocation, { color: theme.textSecondary }]}>
              {event.city}, {event.country}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(event.status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
              {event.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.eventMeta, { borderTopColor: theme.border }]}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {formatDate(event.startDateTime)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {event.currentAttendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} going
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button size="sm" style={styles.actionBtn} onPress={onEdit}>
            <Ionicons name="pencil-outline" size={16} color="white" />
            <Text style={{ color: 'white', marginLeft: Spacing.xs }}>Edit</Text>
          </Button>
          <Button size="sm" style={styles.actionBtn} onPress={onDuplicate}>
            <Ionicons name="duplicate-outline" size={16} color="white" />
            <Text style={{ color: 'white', marginLeft: Spacing.xs }}>Duplicate</Text>
          </Button>
          <Button size="sm" style={[styles.actionBtn, { backgroundColor: Colors.error }]} onPress={onCancel}>
            <Ionicons name="close-circle-outline" size={16} color="white" />
            <Text style={{ color: 'white', marginLeft: Spacing.xs }}>Cancel</Text>
          </Button>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.headingSm,
    marginBottom: Spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    ...Typography.body,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    ...Typography.body,
    marginVertical: Spacing.md,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    marginVertical: Spacing.md,
  },
  infoText: {
    ...Typography.body,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  eventCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  eventImage: {
    height: 200,
    width: '100%',
    marginBottom: Spacing.md,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  eventTitle: {
    ...Typography.headingSm,
    marginBottom: Spacing.xs,
  },
  eventLocation: {
    ...Typography.caption,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  eventMeta: {
    borderTopWidth: 1,
    paddingTopHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: Spacing.xl,
    right: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
})
