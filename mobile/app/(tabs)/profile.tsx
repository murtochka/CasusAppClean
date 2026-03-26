import { Alert, StyleSheet, Text, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button, Card } from '@/components/common'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Colors, Spacing, Typography } from '@/constants'
import { getRoleDisplayName, isBusiness, isAdmin } from '@/utils/roleGuard'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const handleLogout = async () => {
    try {
      await logout()
      Alert.alert('Logged out', 'See you next time!')
      router.replace('/(auth)/login')
    } catch (error) {
      Alert.alert('Logout failed', 'Please try again')
    }
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ME'

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <View style={[styles.header, { borderBottomColor: theme.border }]}> 
          <Text style={[styles.headerTitle, { color: Colors.primary }]}>Profile</Text>
        </View>

        {!!user && (
          <View style={styles.content}>
            <View style={styles.profileCenter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={[styles.name, { color: theme.text }]}>{user.fullName}</Text>
              <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{getRoleDisplayName(user.role)}</Text>
              </View>
            </View>

            <View style={styles.menuList}>
              {isBusiness(user.role) && (
                <>
                  <Card onPress={() => router.push('/(tabs)/guide-dashboard')} style={styles.menuCard}>
                    <View style={styles.menuRow}>
                      <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
                      <Text style={[styles.menuText, { color: Colors.primary, fontWeight: '600' }]}>Business Dashboard</Text>
                    </View>
                  </Card>
                </>
              )}
              {isAdmin(user.role) && (
                <>
                  <Card onPress={() => Alert.alert('Coming Soon', 'Admin panel will be available soon.')} style={styles.menuCard}>
                    <View style={styles.menuRow}>
                      <Ionicons name="shield-checkmark-outline" size={20} color={Colors.error} />
                      <Text style={[styles.menuText, { color: Colors.error, fontWeight: '600' }]}>Admin Panel</Text>
                    </View>
                  </Card>
                </>
              )}
              <Card onPress={() => router.push('/(tabs)/favorites')} style={styles.menuCard}>
                <View style={styles.menuRow}>
                  <Ionicons name="heart-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.menuText, { color: theme.text }]}>Saved / Favorites</Text>
                </View>
              </Card>
              <Card onPress={() => Alert.alert('Coming Soon', 'Profile editing will be added soon.')} style={styles.menuCard}>
                <View style={styles.menuRow}>
                  <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.menuText, { color: theme.text }]}>Edit Profile</Text>
                </View>
              </Card>
              <Card style={styles.menuCard}>
                <View style={styles.menuRow}>
                  <Ionicons name="star-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.menuText, { color: theme.text }]}>My Reviews</Text>
                </View>
              </Card>
              <Card style={styles.menuCard}>
                <View style={styles.menuRow}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.menuText, { color: theme.text }]}>About CasusApp</Text>
                </View>
              </Card>
              <Card style={styles.menuCard}>
                <View style={styles.menuRow}>
                  <Ionicons name="help-circle-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.menuText, { color: theme.text }]}>Help & Support</Text>
                </View>
              </Card>
            </View>

            <Button onPress={handleLogout} variant="outline" icon="log-out-outline" fullWidth>
              Logout
            </Button>

            <Text style={[styles.version, { color: theme.textTertiary }]}>CasusApp v0.1.0</Text>
          </View>
        )}
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
  },
  headerTitle: {
    fontSize: Typography.fontSize['6xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  profileCenter: { alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.fontSize['5xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  name: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize['6xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  email: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  rolePill: {
    marginTop: Spacing.md,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.full,
  },
  roleText: {
    color: '#166534',
    textTransform: 'capitalize',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  menuList: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  menuCard: { padding: Spacing.md },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
})
