import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActivityStore } from '@/store/activityStore';
import { bookingService } from '@/services/bookingService';
import { AvailabilityCalendar, ParticipantPicker } from '@/components/booking';
import { Button, Card, ErrorBoundary } from '@/components/common';
import { Colors, Spacing, Typography } from '@/constants';
import { formatPrice } from '@/utils/formatters';
import type { ActivityAvailability } from '@/types/booking';

export default function BookingScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { currentActivity: activity, isLoading: activityLoading, error: activityError, fetchActivity } = useActivityStore();
  const [slots, setSlots] = useState<ActivityAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<ActivityAvailability | null>(null);
  const [participants, setParticipants] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activityId) {
      fetchActivity(activityId);
    }
  }, [activityId, fetchActivity]);

  useEffect(() => {
    if (!activityId) return;
    const loadSlots = async () => {
      setSlotsLoading(true);
      try {
        const data = await bookingService.getAvailability(activityId);
        setSlots(data || []);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [activityId]);

  const handleSlotSelect = (slot: ActivityAvailability) => {
    setSelectedSlot(slot);
  };

  const maxParticipants = activity?.maxParticipants ?? 1;
  const pricePerPerson = activity ? Number(activity.price) : 0;
  const totalPrice = pricePerPerson * participants;

  const canSubmit =
    activity &&
    selectedSlot &&
    participants >= 1 &&
    participants <= maxParticipants &&
    selectedSlot.availableSpots >= participants;

  const handleConfirmBooking = async () => {
    if (!activity || !selectedSlot || !canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await bookingService.createBooking({
        activityId: activity.id,
        availabilityId: selectedSlot.id,
        participants,
      });
      Alert.alert('Booking confirmed', 'Your booking has been confirmed.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/bookings') },
      ]);
    } catch (err: any) {
      Alert.alert('Booking failed', err?.message || 'Could not complete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (activityLoading || !activityId) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]} edges={['top']}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  if (activityError || !activity) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]} edges={['top']}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Activity not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Book this activity</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.activityCard}>
            <Text style={[styles.activityTitle, { color: theme.text }]}>{activity.title}</Text>
            <Text style={[styles.activityPrice, { color: theme.textSecondary }]}>
              {formatPrice(activity.price)} per person
            </Text>
          </Card>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Select date & time</Text>
          <AvailabilityCalendar
            activityId={activity.id}
            slots={slots}
            isLoading={slotsLoading}
            onSlotSelect={handleSlotSelect}
          />

          {selectedSlot && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Participants</Text>
              <Card>
                <ParticipantPicker
                  participants={participants}
                  maxParticipants={Math.min(maxParticipants, selectedSlot.availableSpots)}
                  onParticipantChange={setParticipants}
                />
              </Card>

              <View style={[styles.summaryRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total</Text>
                <Text style={[styles.summaryTotal, { color: theme.text }]}>{formatPrice(totalPrice)}</Text>
              </View>
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <Button
            onPress={handleConfirmBooking}
            disabled={!canSubmit || submitting}
            fullWidth
          >
            {submitting ? 'Confirming...' : 'Confirm booking'}
          </Button>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.md, fontSize: 12 },
  errorTitle: { marginTop: Spacing.md, fontSize: 15 },
  link: { marginTop: Spacing.md, color: Colors.primary, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.sm },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  activityCard: { marginBottom: Spacing.xl },
  activityTitle: { fontSize: 15, fontWeight: '600' },
  activityPrice: { marginTop: Spacing.xs, fontSize: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  summaryLabel: { fontSize: 14 },
  summaryTotal: { fontSize: 16, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    borderTopWidth: 1,
  },
});
