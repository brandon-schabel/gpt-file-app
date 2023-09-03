import { SyncBoolean } from "../custom/sync-boolean";

export const SyncTest = () => {
  return (
    <>
      <SyncBoolean stateKey="enabledTest" type="checkbox" />
      <SyncBoolean stateKey="enabledTest" type="switch" />
      <SyncBoolean
        stateKey="enabledTest"
        type="toggle-button"
        toggleButtonVariant={{ variant: "ghost", size: "sm" }}
      />
    </>
  );
};
