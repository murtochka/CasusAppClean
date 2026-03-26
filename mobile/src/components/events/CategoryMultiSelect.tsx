/**
 * Multi-Select Category Picker with Search and Premium Icons
 * For Event Creation/Edit - Alternative Tourism Categories
 */

import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Spacing } from '@/constants'

export interface Category {
  id: string
  name: string
  icon: keyof typeof Ionicons.glyphMap
}

export interface CategoryMultiSelectProps {
  selectedCategoryIds: string[]
  onSelectionChange: (categoryIds: string[]) => void
  maxSelections?: number
  placeholder?: string
}

/**
 * Complete Alternative Tourism category mapping with unique Ionicons
 */
export const ALTERNATIVE_TOURISM_CATEGORIES: Category[] = [
  { id: 'hiking-trekking', name: 'Hiking & Trekking', icon: 'mountain-outline' },
  { id: 'rock-climbing', name: 'Rock Climbing', icon: 'fitness-outline' },
  { id: 'alpine-climbing', name: 'Alpine Climbing', icon: 'snow-outline' },
  { id: 'caving', name: 'Caving', icon: 'flashlight-outline' },
  { id: 'paragliding-air', name: 'Paragliding & Air Sports', icon: 'airplane-outline' },
  { id: 'camping', name: 'Camping', icon: 'bonfire-outline' },
  { id: 'fishing', name: 'Fishing', icon: 'fish-outline' },
  { id: 'birdwatching', name: 'Birdwatching', icon: 'binoculars-outline' },
  { id: 'authentic-folklore', name: 'Authentic Folklore', icon: 'musical-notes-outline' },
  { id: 'artisan-workshops', name: 'Artisan Workshops', icon: 'hammer-outline' },
  { id: 'rural-living', name: 'Rural Living', icon: 'home-outline' },
  { id: 'archaeology-tours', name: 'Archaeology Tours', icon: 'footsteps-outline' },
  { id: 'creative-retreats', name: 'Creative Retreats', icon: 'brush-outline' },
  { id: 'wine-tasting', name: 'Wine Tasting', icon: 'wine-outline' },
  { id: 'slow-food', name: 'Slow Food Events', icon: 'restaurant-outline' },
  { id: 'foraging-trips', name: 'Foraging Trips', icon: 'leaf-outline' },
  { id: 'yoga-meditation', name: 'Yoga & Meditation', icon: 'body-outline' },
  { id: 'healing-springs', name: 'Healing Springs', icon: 'water-outline' },
  { id: 'digital-detox', name: 'Digital Detox', icon: 'power-outline' },
  { id: 'stargazing', name: 'Stargazing', icon: 'moon-outline' },
  { id: 'volunteering', name: 'Volunteering', icon: 'heart-outline' },
]

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  selectedCategoryIds,
  onSelectionChange,
  maxSelections,
  placeholder = 'Search categories...',
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return ALTERNATIVE_TOURISM_CATEGORIES
    const query = searchQuery.toLowerCase()
    return ALTERNATIVE_TOURISM_CATEGORIES.filter((cat) =>
      cat.name.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handleToggleCategory = (categoryId: string) => {
    const isSelected = selectedCategoryIds.includes(categoryId)
    
    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedCategoryIds.filter((id) => id !== categoryId))
    } else {
      // Add to selection (respect max limit)
      if (maxSelections && selectedCategoryIds.length >= maxSelections) {
        // Optional: show toast/alert that max reached
        return
      }
      onSelectionChange([...selectedCategoryIds, categoryId])
    }
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.neutral[600]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral[500]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.neutral[600]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selection Summary */}
      {selectedCategoryIds.length > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {selectedCategoryIds.length} selected
            {maxSelections && ` (max ${maxSelections})`}
          </Text>
          <TouchableOpacity onPress={clearSelection}>
            <Text style={styles.clearButton}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.categoryGrid}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((category) => {
          const isSelected = selectedCategoryIds.includes(category.id)
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
              ]}
              onPress={() => handleToggleCategory(category.id)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={category.icon}
                  size={24}
                  color={isSelected ? Colors.primaryShades[700] : Colors.neutral[700]}
                />
              </View>
              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                ]}
                numberOfLines={2}
              >
                {category.name}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primaryShades[700]} />
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {filteredCategories.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={Colors.neutral[400]} />
          <Text style={styles.emptyText}>No categories found</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.body,
    color: Colors.neutral[900],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  summaryText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.neutral[700],
  },
  clearButton: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primaryShades[600],
  },
  scrollView: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: Spacing.xl,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.lg,
    padding: Spacing.md,
    marginRight: '2%',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    alignItems: 'center',
    position: 'relative',
    minHeight: 110,
  },
  categoryCardSelected: {
    borderColor: Colors.primaryShades[600],
    backgroundColor: Colors.primaryShades[50],
  },
  categoryIcon: {
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: Colors.primaryShades[800],
    fontFamily: Typography.fontFamily.semiBold,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.body,
    color: Colors.neutral[600],
  },
})
