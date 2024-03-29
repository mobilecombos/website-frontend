import { useEffect } from 'react';

import { NsgUpload } from './UploadForm/NsgUpload';
import { QualcommHexdumpUpload } from './UploadForm/QualcommHexdumpUpload';
import { ImportOnlyUpload } from './UploadForm/ImportOnly';

import SelectFormType from './UploadForm/SelectFormType';
import AdminAuthDetailsEntry from '../AdminAuthDetailsEntry';

import Section from '@components/Design/Section';
import Hero from '@components/Design/Hero';
import Breadcrumbs from '@components/Design/Breadcrumbs';

import { useApiStore } from '@api/ApiStoreProvider';
import DeviceFirmware from '@api/Models/DeviceFirmware';
import CapabilitySet from '@api/Models/CapabilitySet';
import { useLoadDevice } from '@hooks/useLoadDevice';
import useStateWithLocalStorage from '@hooks/useStateWithLocalStorage';

import { navigate } from 'gatsby';
import { useSnackbar } from 'notistack';

import type { RouteComponentProps } from '@gatsbyjs/reach-router';

export const ADMIN_UPLOAD_FORM_TYPE_OPTIONS = {
  NSG: NsgUpload,
  'Qualcomm 0xB0CD/0xB826 hexdump': QualcommHexdumpUpload,
  'Import pre-parsed JSON': ImportOnlyUpload,
} as const;

export type AdminUploadFormType = keyof typeof ADMIN_UPLOAD_FORM_TYPE_OPTIONS;

export interface AdminComboUploadFormPageProps extends RouteComponentProps {
  deviceUuid?: string;
  firmwareUuid?: string;
  capSetUuid?: string;
}

export default function AdminComboUploadFormPage({ deviceUuid, firmwareUuid, capSetUuid }: AdminComboUploadFormPageProps) {
  const store = useApiStore();
  const { enqueueSnackbar } = useSnackbar();

  const [formType, setFormType] = useStateWithLocalStorage<AdminUploadFormType>('admin/combos-upload/form-type', 'NSG', (val) =>
    Object.keys(ADMIN_UPLOAD_FORM_TYPE_OPTIONS).includes(val)
  );

  const { device, loadingState, error } = useLoadDevice(deviceUuid ?? '', ['modem', 'deviceFirmwares', 'deviceFirmwares.capabilitySets']);
  const firmware = store.getFirstBy<DeviceFirmware>('device-firmwares', 'uuid', firmwareUuid ?? '');
  const capSet = store.getFirstBy<CapabilitySet>('capability-sets', 'uuid', capSetUuid ?? '');

  const isValidFw = device && firmware && (device?.deviceFirmwares() || []).some((fw) => fw?.uuid() === firmware.uuid());
  const isValidCapSet = isValidFw && capSet && (firmware?.capabilitySets() || []).some((cs) => cs?.uuid() === capSet.uuid());

  useEffect(() => {
    if (!firmwareUuid) {
      if (!deviceUuid) {
        navigate(`/admin/upload`);
        return;
      }

      navigate(`/admin/upload/${deviceUuid}`);
      return;
    }
  }, []);

  useEffect(() => {
    if (loadingState === 'error') {
      enqueueSnackbar('Error loading device data from server', { variant: 'error' });
      navigate(`/admin/upload`);
    }
  }, [loadingState]);

  useEffect(() => {
    if (loadingState === 'loaded') {
      if (!isValidFw) {
        navigate(`/admin/upload/${deviceUuid}`);
        return;
      }

      if (!isValidCapSet) {
        navigate(`/admin/upload/${deviceUuid}/${firmwareUuid}`);
        return;
      }
    }
  }, [isValidCapSet, isValidFw, loadingState, deviceUuid, firmwareUuid]);

  const FormComponent = ADMIN_UPLOAD_FORM_TYPE_OPTIONS[formType];

  return (
    <>
      <Hero firstElement>
        <h1 className="text-shout">Upload combos to capability set</h1>
      </Hero>

      <Breadcrumbs
        data={[
          {
            t: 'Home',
            url: `/`,
          },
          {
            t: 'Admin',
            url: `/admin`,
          },
          {
            t: 'Upload',
            url: `/admin/upload`,
          },
          {
            t: device?.deviceName() ?? 'Loading device...',
            url: `/admin/upload/${deviceUuid}`,
          },
          {
            t: firmware?.name() ?? 'Loading device...',
            url: `/admin/upload/${deviceUuid}/${firmwareUuid}`,
          },
          {
            t: capSet?.description() ?? 'Loading device...',
            url: `/admin/upload/${deviceUuid}/${firmwareUuid}/${capSetUuid}`,
          },
        ]}
      />

      <AdminAuthDetailsEntry /*sectionProps={{ darker: false }}*/ />

      <Section>
        <div css={{ maxWidth: 720, margin: 'auto' }}>
          <h2 className="text-louder">Upload form</h2>
          <p className="text-speak">
            Upload combos to the capability set <strong>{capSet?.description()}</strong> for the{' '}
            <strong>
              {device?.manufacturer()} {device?.deviceName()} ({device?.modelName()})
            </strong>
            .
          </p>
          <p className="speak-text">To skip specific RATs, leave those fields blank when submitting.</p>
        </div>

        <SelectFormType
          value={formType}
          onChange={(val) => {
            setFormType(val);
          }}
        />

        <div css={{ marginTop: 24 }}>{isValidCapSet && <FormComponent device={device} capabilitySet={capSet} />}</div>
      </Section>
    </>
  );
}
