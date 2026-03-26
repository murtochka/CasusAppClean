import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSearch } from '@/hooks/useSearch'
import { useDebounce } from '@/hooks/useDebounce'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { Ionicons } from '@expo/vector-icons'
import { searchService } from '@/services/searchService'
import { FilterSheet } from '@/components/search/FilterSheet'
import { ActivityCard } from '@/components/search/ActivityCard'
import { router } from 'expo-router'
import { SearchFiltersRequest } from '@/types/search'
import { Button, Input, ErrorBoundary } from '@/components/common'
import { ActivityCardSkeleton } from '@/components/skeletons'
import { Colors, Spacing, Typography } from '@/constants'
import { useAuthStore } from '@/store/authStore'

export default function SearchScreen() {
  const { results, metadata, filters, isLoading, pagination, loadMetadata, search, setFilters, resetFilters, loadMore, error, clearError } = useSearch()
  const { metadataReady } = useAuthStore()
  const { isOnline } = useNetworkStatus()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const debouncedCity = useDebounce(cityQuery, 300)

  useEffect(() => {
    // Only load metadata if not already loaded (fallback)
    if (!metadataReady) {
      loadMetadata()
    }
  }, [metadataReady, loadMetadata])

  // Load city suggestions when city query changes
  useEffect(() => {
    if (!debouncedCity || debouncedCity.length < 2) {
      setCitySuggestions([])
      return
    }

    const loadSuggestions = async () => {
      try {
        const response = await searchService.getSuggestions(debouncedCity, 'city')
        setCitySuggestions(response.cities || [])
      } catch (error) {
        console.error('Failed to load suggestions', error)
      }
    }

    loadSuggestions()
  }, [debouncedCity])

  const handleSearch = () => {
    clearError()
    const searchFilters: SearchFiltersRequest = {
      ...filters,
      city: cityQuery || undefined,
      limit: 20,
      offset: 0,
    }
    search(searchFilters)
    setCitySuggestions([])
  }

  const handleCitySelect = (city: string) => {
    setCityQuery(city)
    setCitySuggestions([])
  }

  const handleApplyFilters = (newFilters: SearchFiltersRequest) => {
    clearError()
    setFilters(newFilters)
    search({ ...newFilters, city: cityQuery || undefined })
  }

  const handleResetFilters = () => {
    resetFilters()
    setCityQuery('')
    clearError()
  }

  const handleActivityPress = (activityId: string) => {
    router.push(`/activity/${activityId}`)
  }

  const handleLoadMore = () => {
    if (!isLoading && results.length < pagination.total) {
      loadMore()
    }
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: theme.background }]}> 
          <View style={[styles.header, { borderBottomColor: theme.border }]}> 
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: Colors.primary }]}>Discover</Text>
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Find amazing experiences near you</Text>
            </View>
            <Pressable 
              onPress={() => metadataReady && setIsFilterSheetOpen(true)} 
              style={styles.filterBtn}
              disabled={!metadataReady}
              opacity={metadataReady ? 1 : 0.5}
            >
              <Ionicons name="options-outline" size={22} color={Colors.primary} />
            </Pressable>
          </View>

          {!isOnline && (
            <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline-outline" size={16} color={Colors.warning} />
              <Text style={styles.offlineText}>You are offline - using cached results</Text>
            </View>
          )}

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: Colors.error + '15', borderColor: Colors.error }]}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Text style={[styles.errorText, { color: Colors.error, flex: 1 }]} numberOfLines={2}>{error}</Text>
              <Pressable onPress={clearError} hitSlop={8}>
                <Ionicons name="close" size={16} color={Colors.error} />
              </Pressable>
            </View>
          )}

          <View style={styles.searchWrap}>
            <View style={styles.searchRow}>
              <Input
                value={cityQuery}
                onChangeText={setCityQuery}
                placeholder="Search by city..."
                leftIcon="search-outline"
                containerStyle={{ flex: 1 }}
              />
              <Button onPress={handleSearch} loading={isLoading} style={styles.goBtn}>Go</Button>
            </View>

            {citySuggestions.length > 0 && (
              <View style={[styles.suggestions, { backgroundColor: theme.card, borderColor: theme.border }]}> 
                {citySuggestions.map((city, idx) => (
                  <Pressable
                    key={`${city}-${idx}`}
                    onPress={() => handleCitySelect(city)}
                    style={({ pressed }) => [styles.suggestionItem, pressed && styles.suggestionPressed]}
                  >
                    <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.suggestionText, { color: theme.text }]}>{city}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.resultsWrap}>
            {isLoading && results.length === 0 ? (
              <View>
                {[1, 2, 3].map((i) => (
                  <ActivityCardSkeleton key={i} />
                ))}
              </View>
            ) : !isLoading && results.length === 0 ? (
              <View style={styles.centerWrap}>
                <Ionicons name="search-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No results found</Text>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Try searching for a different city</Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ActivityCard activity={item} onPress={handleActivityPress} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                scrollEnabled={results.length > 0}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                ListFooterComponent={
                  isLoading ? (
                    <View style={styles.footerWrap}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                      <Text style={[styles.footerText, { color: theme.textTertiary }]}>Loading more...</Text>
                    </View>
                  ) : results.length >= pagination.total ? (
                    <View style={styles.footerWrap}>
                      <Text style={[styles.footerText, { color: theme.textTertiary }]}>No more results</Text>
                    </View>
                  ) : null
                }
              />
            )}
          </View>

          {/* FilterSheet Modal */}
          <FilterSheet
            isOpen={isFilterSheetOpen}
            onClose={() => setIsFilterSheetOpen(false)}
            metadata={metadata}
            currentFilters={filters}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['6xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  headerSub: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.transparent.black05,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  offlineText: {
    color: '#92400E',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  searchWrap: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  searchRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  goBtn: { paddingHorizontal: Spacing.lg },
  suggestions: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  suggestionPressed: {
    opacity: 0.85,
    backgroundColor: Colors.transparent.black05,
  },
  suggestionText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  resultsWrap: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { marginTop: Spacing.sm, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.regular },
  emptyTitle: { marginTop: Spacing.md, fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.semibold },
  emptyText: { marginTop: Spacing.xs, textAlign: 'center', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.regular },
  footerWrap: { alignItems: 'center', paddingVertical: Spacing.lg, flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  footerText: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.regular },
})
