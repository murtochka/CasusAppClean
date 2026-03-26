import React, { useState, useEffect } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native'
import { SearchFiltersRequest, SearchMetadata } from '@/types/search'
import { formatPrice } from '@/utils/formatters'
import { Button } from '../common'
import { Colors, Typography, Spacing } from '@/constants'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  metadata: SearchMetadata | null
  currentFilters: SearchFiltersRequest
  onApplyFilters: (filters: SearchFiltersRequest) => void
  onResetFilters: () => void
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  metadata,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}) => {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  // Local filter state
  const [filters, setFilters] = useState<SearchFiltersRequest>(currentFilters)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  // Sync with currentFilters when they change externally
  useEffect(() => {
    setFilters(currentFilters)
  }, [currentFilters])

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleReset = () => {
    onResetFilters()
    setFilters({})
    onClose()
  }

  const updateFilter = (key: keyof SearchFiltersRequest, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const startDate = filters.startDate ? new Date(filters.startDate) : new Date()
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date()

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      updateFilter('startDate', selectedDate.toISOString().split('T')[0])
    }
  }

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      updateFilter('endDate', selectedDate.toISOString().split('T')[0])
    }
  }

  if (!metadata) {
    return null
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Filters</Text>
            <Pressable onPress={handleReset}>
              <Text style={styles.resetText}>Reset All</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <Pressable
                style={[styles.chip, { borderColor: !filters.categoryId ? Colors.primary : theme.border }]}
                onPress={() => updateFilter('categoryId', undefined)}
                hitSlop={4}
              >
                <Text style={[styles.chipText, { color: !filters.categoryId ? Colors.primary : theme.textSecondary }]}>All</Text>
              </Pressable>
              {metadata.categories.map((cat) => {
                const active = filters.categoryId === cat.id
                return (
                  <Pressable
                    key={cat.id}
                    style={({ pressed }) => [
                      styles.chip,
                      { borderColor: active ? Colors.primary : theme.border },
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() => updateFilter('categoryId', cat.id)}
                    hitSlop={4}
                  >
                    <Text style={[styles.chipText, { color: active ? Colors.primary : theme.textSecondary }]}>{cat.name}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <Text style={[styles.label, { color: theme.text }]}>Date Range</Text>
            <View style={styles.rowTwo}>
              <Button variant="outline" onPress={() => setShowStartDatePicker(true)} style={styles.flexBtn}>
                {filters.startDate || 'Start Date'}
              </Button>
              <Button variant="outline" onPress={() => setShowEndDatePicker(true)} style={styles.flexBtn}>
                {filters.endDate || 'End Date'}
              </Button>
            </View>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
                minimumDate={filters.startDate ? new Date(filters.startDate) : new Date()}
              />
            )}

            <Text style={[styles.label, { color: theme.text }]}>Price Range</Text>
            <View style={styles.rowTwo}>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder={`Min (${metadata.priceMin})`}
                placeholderTextColor={theme.textTertiary}
                keyboardType="numeric"
                value={filters.priceMin?.toString() || ''}
                onChangeText={(value) => updateFilter('priceMin', value ? Number(value) : undefined)}
              />
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder={`Max (${metadata.priceMax})`}
                placeholderTextColor={theme.textTertiary}
                keyboardType="numeric"
                value={filters.priceMax?.toString() || ''}
                onChangeText={(value) => updateFilter('priceMax', value ? Number(value) : undefined)}
              />
            </View>
            <Text style={[styles.helper, { color: theme.textTertiary }]}>
              Current: {formatPrice(filters.priceMin || metadata.priceMin)} - {formatPrice(filters.priceMax || metadata.priceMax)}
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
            <View style={styles.rowTwo}>
              {['', 'easy', 'medium', 'hard'].map((level) => {
                const active = (filters.difficulty || '') === level
                const label = level || 'all'
                return (
                  <Pressable
                    key={label}
                    style={({ pressed }) => [
                      styles.diffChip,
                      { borderColor: active ? Colors.primary : theme.border },
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() => updateFilter('difficulty', level || undefined)}
                    hitSlop={4}
                  >
                    <Text style={[styles.chipText, { color: active ? Colors.primary : theme.textSecondary, textTransform: 'capitalize' }]}>{label}</Text>
                  </Pressable>
                )
              })}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Minimum Rating</Text>
            <View style={styles.rowTwo}>
              {[1, 2, 3, 4, 5].map((rating) => {
                const active = filters.minRating === rating
                return (
                  <Pressable
                    key={rating}
                    style={({ pressed }) => [
                      styles.diffChip,
                      { borderColor: active ? Colors.primary : theme.border },
                      pressed && styles.chipPressed,
                    ]}
                    onPress={() => updateFilter('minRating', active ? undefined : rating)}
                    hitSlop={4}
                  >
                    <Text style={[styles.chipText, { color: active ? Colors.primary : theme.textSecondary }]}>{rating}+</Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <Button variant="outline" onPress={onClose} style={styles.flexBtn}>Cancel</Button>
            <Button onPress={handleApply} style={styles.flexBtn}>Apply Filters</Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 26 : 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  resetText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
  },
  label: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  chipsRow: { gap: 8, paddingBottom: 2 },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.radius.full,  // Full rounded pills
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipPressed: {
    opacity: 0.86,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  flexBtn: { flex: 1 },
  input: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderRadius: Spacing.radius.md,  // Consistent input radius
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  helper: {
    marginTop: 6,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  diffChip: {
    borderWidth: 1,
    borderRadius: Spacing.radius.md,  // Consistent chip radius
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 68,
    alignItems: 'center',
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
})
