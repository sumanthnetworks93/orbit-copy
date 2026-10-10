import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  MEMBERSHIP_PLANS,
  getEmployerBilling,
  getPlan,
  monthSpend,
  quoteNextJobPost,
  rupees,
  subscribeToPlan,
  type EmployerBilling,
  type PlanId,
} from '../../services/employerBilling';
import { isStoreRelease } from '../../config/release';
import { CardMeta, CardTitle, DeskButton, DeskScreen, PageHeader, Section, Surface } from '../../ui';

export function EmployerBillingScreen() {
  const [billing, setBilling] = useState<EmployerBilling | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getEmployerBilling().then(setBilling).catch(() => undefined);
    }, []),
  );

  const storeRelease = isStoreRelease();
  const plan = getPlan(billing?.planId ?? 'free');
  const used = billing?.postsThisMonth ?? 0;
  const spend = billing ? monthSpend(billing) : 0;

  async function subscribe(planId: PlanId) {
    const next = await subscribeToPlan(planId);
    setBilling(next);
    await quoteNextJobPost();
  }

  return (
    <DeskScreen testID="employer-billing">
      <PageHeader
        kicker="Plans"
        title="Billing"
        subtitle={`${plan.name} · ${used} of ${plan.jobsPerMonth} included jobs used this month · ${rupees(spend)} spent`}
      />
      <Section hint={storeRelease
        ? 'Payments are not live. Plans are a preview and do not charge you. Google Play Billing will be required before paid subscribe.'
        : 'Two jobs each month are free. Extra posts are ₹25. GST invoices come from the registered Orbit entity.'}>
        {MEMBERSHIP_PLANS.map((item) => {
          const active = item.id === plan.id;
          const paidLocked = storeRelease && item.priceInr > 0;
          return (
            <Surface key={item.id} testID={`employer-plan-${item.id}`}>
              <CardTitle>{`${item.name}${active ? ' · Current' : ''}`}</CardTitle>
              <CardMeta>
                {`${item.priceInr === 0 ? '₹0 / month' : `${rupees(item.priceInr)} / month`} · ${item.jobsPerMonth} jobs included · extras ${rupees(item.extraJobInr)}`}
              </CardMeta>
              <CardMeta>{item.blurb}</CardMeta>
              {paidLocked ? <CardMeta>Coming soon on Google Play</CardMeta> : null}
              {active || paidLocked ? null : (
                <DeskButton
                  testID={`employer-subscribe-${item.id}`}
                  label={item.priceInr === 0 ? 'Switch to Free' : `Subscribe · ${rupees(item.priceInr)}`}
                  variant="ghost"
                  onPress={() => void subscribe(item.id)}
                />
              )}
            </Surface>
          );
        })}
      </Section>
    </DeskScreen>
  );
}
