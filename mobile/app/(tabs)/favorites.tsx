import { useEffect } from 'react'
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFavoriteStore } from '@/store/favoriteStore'
import { Ionicons } from '@expo/vector-icons'
import { Button, Card, ErrorBoundary } from '@/components/common'
import { ActivityCardSkeleton } from '@/components/skeletons'
import { Colors, Spacing, Typography } from '@/constants'
import { router } from 'expo-router'

export default function FavoritesScreen() {
  const { favorites, isLoading, error, loadFavorites, removeFavorite, clearError } = useFavoriteStore()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error)
      clearError()
    }
  }, [error, clearError])

  const handleRemove = async (activityId: string) => {
    try {
      await removeFavorite(activityId)
      Alert.alert('Done', 'Removed from favorites')
    } catch (error) {
      console.error('Failed to remove favorite', error)
    }
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: theme.background }]}> 
          <View style={[styles.header, { borderBottomColor: theme.border }]}> 
            <Text style={[styles.headerTitle, { color: Colors.primary }]}>Favorites</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}> 
              {favorites.length} saved {favorites.length === 1 ? 'activity' : 'activities'}
            </Text>
          </View>

          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.skeletonWrap}>
                {[1, 2, 3].map((i) => (
                  <ActivityCardSkeleton key={i} />
                ))}
              </View>
            ) : !isLoading && favorites.length === 0 ? (
              <View style={styles.centerWrap}>
                <Ionicons name="heart-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No favorites yet</Text>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Save activities you love to access them quickly</Text>
                <Button onPress={() => router.push('/(tabs)/search')} style={styles.emptyButton}>Explore Activities</Button>
              </View>
            ) : (
              <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card style={styles.itemCard} onPress={() => router.push(`/activity/${item.activityId}`)}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemTitle, { color: theme.text }]}>Activity #{item.activityId.substring(0, 8)}</Text>
                        <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Saved on {new Date(item.createdAt).toLocaleDateString()}</Text>
                      </View>
                      <Pressable onPress={() => handleRemove(item.activityId)} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </Pressable>
                    </View>
                  </Card>
                )}
                scrollEnabled={favorites.length > 0}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1 },
  headerTitle: { fontSize: Typography.fontSize['6xl'], fontFamily: Typography.fontFamily.bold },
  headerSub: { marginTop: Spacing.xs, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.regular },
  content: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  skeletonWrap: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  emptyTitle: { marginTop: Spacing.md, fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.semibold },
  emptyText: { marginTop: Spacing.xs, textAlign: 'center', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.regular },
  emptyButton: { marginTop: Spacing.lg },
  itemCard: { marginBottom: Spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.semibold },
  itemMeta: { marginTop: Spacing.xs, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.regular },
  iconBtn: { padding: Spacing.sm },
})
