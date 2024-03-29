import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import DeviceSettingsAtom from '@atoms/DeviceSettingsAtom';
import { useApiStore } from '@api/ApiStoreProvider';
import useIsFirstRender from '@hooks/useIsFirstRender';
import Section from '@components/Design/Section';
import LoadingSpinner from '@components/LoadingSpinner';
import ComboTable from './ComboTable';

import type CapabilitySet from '@api/Models/CapabilitySet';
import type Combo from '@api/Models/Combo';

function isFullCapSetDataLoaded(capSet: CapabilitySet | undefined): boolean {
  if (!capSet) return false;

  if (!capSet.combos()) return false;

  const combos: (Combo | undefined)[] = capSet.combos() || [];

  if (combos.some((c) => !c)) return false;

  return true;
}

export default function CapabilitySetVisualiser() {
  const { selectedCapabilitySetUuid } = useRecoilValue(DeviceSettingsAtom);
  const store = useApiStore();
  const [error, setError] = useState<{ capSetUuid: string; error: any } | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const capSet = store.getFirstBy<CapabilitySet>('capability-sets', 'uuid', selectedCapabilitySetUuid);
  const isFirstRender = useIsFirstRender();

  const [isLoadingCapSetInfo, setIsLoadingCapSetInfo] = useState(true);

  function loadFullCapSetData() {
    setIsLoadingCapSetInfo(true);
    setError(null);

    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    store
      .find<CapabilitySet[]>(
        'capability-sets',
        {
          include: [
            'combos',
            'combos.lteComponents',
            'combos.nrComponents',
            'combos.lteComponents.dlMimos',
            'combos.lteComponents.ulMimos',
            'combos.lteComponents.dlModulations',
            'combos.lteComponents.ulModulations',
            'combos.nrComponents.dlMimos',
            'combos.nrComponents.ulMimos',
            'combos.nrComponents.dlModulations',
            'combos.nrComponents.ulModulations',
          ],
          filter: {
            uuid: selectedCapabilitySetUuid,
          },
          page: {
            limit: 1,
          },
        },
        { abortController: abortController.current }
      )
      .then((data) => {
        const foundCapSet = data?.[0];

        if (!foundCapSet) {
          const message = 'Capability set not found';

          if (error?.error !== message && error?.capSetUuid !== selectedCapabilitySetUuid) {
            setError({ error: message, capSetUuid: selectedCapabilitySetUuid });
          }
        } else {
          setError(null);
        }

        setIsLoadingCapSetInfo(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          setError(null);
          return;
        }

        setError({ error: err, capSetUuid: selectedCapabilitySetUuid });
      });
  }

  useEffect(() => {
    if (error && error.capSetUuid !== selectedCapabilitySetUuid) {
      setError(null);
    } else {
      if (!isFullCapSetDataLoaded(capSet)) {
        if (!error || error?.capSetUuid !== selectedCapabilitySetUuid) loadFullCapSetData();
      } else {
        if (isLoadingCapSetInfo) setIsLoadingCapSetInfo(false);
      }
    }
  }, [error, capSet, isLoadingCapSetInfo, selectedCapabilitySetUuid]);

  if (error) {
    return (
      <Section width="wider">
        <h3 className="text-loud">Combos</h3>

        <p className="text-speak">Something went wrong when fetching data for this device. Please try again later.</p>

        {typeof error === 'string' && (
          <p className="text-speak">
            <strong>Error:</strong> {error}
          </p>
        )}
      </Section>
    );
  }

  if (isFirstRender || selectedCapabilitySetUuid === 'null' || !selectedCapabilitySetUuid) {
    return (
      <Section width="wider">
        <h3 className="text-loud">Combos</h3>

        <p className="text-speak">Please choose a firmware and capability set from the list above.</p>
      </Section>
    );
  }

  return (
    <Section
      width="full"
      css={{
        '> div': { maxWidth: 1400 },
      }}
    >
      <div css={{ maxWidth: 720, padding: '0 32px', margin: 'auto' }}>
        <h3 className="text-loud">Combos</h3>

        {isLoadingCapSetInfo && (
          <>
            <LoadingSpinner />
            <p className="text-speak" css={{ textAlign: 'center', marginTop: 16 }}>
              Loading combos...
            </p>
          </>
        )}
      </div>

      {capSet?.combos() && <ComboTable capabilitySetUuid={selectedCapabilitySetUuid} />}
    </Section>
  );
}
