import React, { useEffect, useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import { Button, Card, colors, ErrorState, fontSizes, fontWeights, Input, Skeleton, spacing } from '@repo/ui'
import { PageShell } from '../../components/PageShell'
import { SectionHeader } from '../../components/SectionHeader'
import { useGetSettings } from '@repo/api-client'
import { useUpdateSettings } from '../../hooks/useSettings'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function SettingsScreen() {
  const { data: settings, isLoading, isError, refetch } = useGetSettings()
  const { mutate: updateSettings, isPending: saving } = useUpdateSettings()

  const [prepTimeMins, setPrepTimeMins] = useState('15')
  const [autoAccept, setAutoAccept] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({})
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!settings) return
    setPrepTimeMins(String(settings.prepTimeMins ?? 15))
    setAutoAccept(Boolean(settings.autoAccept))
    setIsOpen(Boolean(settings.isOpen))
    setHours((settings.openingHours as any) ?? {})
    setDirty(false)
  }, [settings])

  const mark = () => setDirty(true)

  const handleSave = () => {
    updateSettings({
      data: {
        prepTimeMins: parseInt(prepTimeMins) || 15,
        autoAccept,
        isOpen,
        openingHours: hours as any,
      },
    }, { onSuccess: () => setDirty(false) })
  }

  if (isError) return <PageShell title="Settings"><ErrorState onRetry={refetch} /></PageShell>

  return (
    <PageShell
      title="Settings"
      subtitle="Restaurant configuration"
      headerRight={
        <Button onPress={handleSave} loading={saving} disabled={!dirty} size="sm">
          {dirty ? 'Save Changes' : 'Saved'}
        </Button>
      }
    >
      {isLoading ? (
        <View style={{ gap: spacing[4] }}>
          <Skeleton height={120} /><Skeleton height={120} /><Skeleton height={240} />
        </View>
      ) : (
        <>
          {/* Service Availability */}
          <View style={styles.section}>
            <SectionHeader title="Service Availability" />
            <Card>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Restaurant Open</Text>
                  <Text style={styles.toggleDesc}>Toggle to open or close for orders</Text>
                </View>
                <Switch
                  value={isOpen}
                  onValueChange={(v) => { setIsOpen(v); mark() }}
                  trackColor={{ false: colors.borderStrong, true: colors.brand }}
                  thumbColor="#fff"
                />
              </View>
              <View style={[styles.toggleRow, styles.toggleBorder]}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Auto-Accept Orders</Text>
                  <Text style={styles.toggleDesc}>Automatically accept incoming orders</Text>
                </View>
                <Switch
                  value={autoAccept}
                  onValueChange={(v) => { setAutoAccept(v); mark() }}
                  trackColor={{ false: colors.borderStrong, true: colors.brand }}
                  thumbColor="#fff"
                />
              </View>
            </Card>
          </View>

          {/* Order Settings */}
          <View style={styles.section}>
            <SectionHeader title="Order Settings" />
            <Card>
              <Input
                label="Default Prep Time (minutes)"
                value={prepTimeMins}
                onChangeText={(v) => { setPrepTimeMins(v); mark() }}
                keyboardType="number-pad"
                hint="Shown to customers as estimated wait time"
              />
            </Card>
          </View>

          {/* Opening Hours */}
          <View style={styles.section}>
            <SectionHeader title="Opening Hours" />
            <Card padding="none">
              {DAYS.map((day, i) => {
                const h = hours[day] ?? { open: '09:00', close: '22:00', closed: false }
                return (
                  <View key={day} style={[styles.hourRow, i > 0 ? styles.hourBorder : null]}>
                    <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                    <Switch
                      value={!h.closed}
                      onValueChange={(v) => {
                        setHours((prev) => ({ ...prev, [day]: { ...h, closed: !v } }))
                        mark()
                      }}
                      trackColor={{ false: colors.borderStrong, true: colors.brand }}
                      thumbColor="#fff"
                    />
                    {!h.closed ? (
                      <View style={styles.timeInputs}>
                        <Input
                          value={h.open}
                          onChangeText={(v) => { setHours((prev) => ({ ...prev, [day]: { ...h, open: v } })); mark() }}
                          containerStyle={styles.timeInput}
                          placeholder="09:00"
                        />
                        <Text style={styles.timeSep}>–</Text>
                        <Input
                          value={h.close}
                          onChangeText={(v) => { setHours((prev) => ({ ...prev, [day]: { ...h, close: v } })); mark() }}
                          containerStyle={styles.timeInput}
                          placeholder="22:00"
                        />
                      </View>
                    ) : (
                      <Text style={styles.closedText}>Closed</Text>
                    )}
                  </View>
                )
              })}
            </Card>
          </View>

          {dirty && (
            <Button onPress={handleSave} loading={saving} fullWidth>Save All Changes</Button>
          )}
        </>
      )}
    </PageShell>
  )
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing[6] },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2] },
  toggleBorder: { borderTopWidth: 1, borderTopColor: colors.borderDefault, marginTop: spacing[3], paddingTop: spacing[3] },
  toggleInfo: { flex: 1, marginRight: spacing[4] },
  toggleLabel: { fontSize: fontSizes.md, fontWeight: '500', color: colors.textPrimary },
  toggleDesc: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  hourRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[2.5], gap: spacing[3] },
  hourBorder: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
  dayName: { width: 90, fontSize: fontSizes.sm, fontWeight: '500', color: colors.textPrimary },
  timeInputs: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  timeInput: { flex: 1 },
  timeSep: { fontSize: fontSizes.md, color: colors.textSecondary },
  closedText: { flex: 1, fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: 'italic' },
})
