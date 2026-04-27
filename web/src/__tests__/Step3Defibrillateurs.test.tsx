import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { createEmptyDevice } from "@/lib/declaration-types";
import type { DaeDeviceFormState } from "@/lib/declaration-types";

// --- Mocks ---

vi.mock("@/components/declarerdae/declaration/devices/DaeDeviceCard", () => ({
  default: ({
    device,
    index,
    isOpen,
    canDelete,
    syncedToGeodae,
    onToggle,
    onDelete,
  }: any) => (
    <div data-testid={`device-card-${device.localId}`}>
      <span data-testid={`device-name-${device.localId}`}>
        {device.nom?.trim() || `DAE ${index + 1}`}
      </span>
      {isOpen && <span data-testid={`device-open-${device.localId}`} />}
      {syncedToGeodae && (
        <span data-testid={`device-synced-${device.localId}`}>GéoDAE</span>
      )}
      <button
        data-testid={`device-toggle-${device.localId}`}
        onClick={onToggle}
      >
        Toggle
      </button>
      {(canDelete || syncedToGeodae) && (
        <button
          data-testid={`device-delete-${device.localId}`}
          onClick={onDelete}
        >
          Supprimer
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/declarerdae/declaration/devices/DaeDeviceForm", () => ({
  default: ({ device, index }: any) => (
    <div data-testid={`device-form-${device.localId}`}>
      Formulaire DAE {index + 1}
    </div>
  ),
}));

// Import after mocks
import Step3 from "@/components/declarerdae/declaration/steps/Step3Defibrillateurs";

// --- Helpers ---

function makeDevice(
  overrides: Partial<DaeDeviceFormState> & { localId: string },
): DaeDeviceFormState {
  return { ...createEmptyDevice(0), ...overrides };
}

const defaultDevice = () =>
  makeDevice({ localId: "dev-1", nom: "DAE Accueil", position: 0 });

function renderStep3(
  props: Partial<Parameters<typeof Step3>[0]> = {},
) {
  const defaultProps = {
    devices: [defaultDevice()],
    siteLat: 48.8566 as number | null,
    siteLng: 2.3522 as number | null,
    onDeviceChange: vi.fn(),
    onAddDevice: vi.fn(async () => "new-device-id"),
    onRemoveDevice: vi.fn(),
    ...props,
  };
  return {
    ...render(<Step3 {...defaultProps} />),
    ...defaultProps,
  };
}

// --- Tests ---

describe("Step3Defibrillateurs", () => {
  describe("rendering", () => {
    it("renders the title and description", () => {
      renderStep3();
      expect(screen.getByText(/Défibrillateur\(s\)/)).toBeInTheDocument();
      expect(
        screen.getByText(/Renseignez les informations de chaque défibrillateur/),
      ).toBeInTheDocument();
    });

    it("renders device cards for each device", () => {
      const devices = [
        makeDevice({ localId: "d1", nom: "DAE 1", position: 0 }),
        makeDevice({ localId: "d2", nom: "DAE 2", position: 1 }),
      ];
      renderStep3({ devices });
      expect(screen.getByTestId("device-card-d1")).toBeInTheDocument();
      expect(screen.getByTestId("device-card-d2")).toBeInTheDocument();
    });

    it("renders the add device button", () => {
      renderStep3();
      expect(
        screen.getByText("Ajouter un défibrillateur"),
      ).toBeInTheDocument();
    });
  });

  describe("device counter", () => {
    it("does not show counter for single device", () => {
      renderStep3();
      expect(
        screen.queryByText(/défibrillateurs déclarés/),
      ).not.toBeInTheDocument();
    });

    it("shows counter for multiple devices", () => {
      const devices = [
        makeDevice({ localId: "d1", position: 0 }),
        makeDevice({ localId: "d2", position: 1 }),
        makeDevice({ localId: "d3", position: 2 }),
      ];
      renderStep3({ devices });
      expect(
        screen.getByText("3 défibrillateurs déclarés"),
      ).toBeInTheDocument();
    });
  });

  describe("accordion behavior", () => {
    it("first device is expanded by default", () => {
      renderStep3();
      expect(screen.getByTestId("device-open-dev-1")).toBeInTheDocument();
      expect(screen.getByTestId("device-form-dev-1")).toBeInTheDocument();
    });

    it("clicking toggle on closed device opens it and closes others", () => {
      const devices = [
        makeDevice({ localId: "d1", nom: "DAE 1", position: 0 }),
        makeDevice({ localId: "d2", nom: "DAE 2", position: 1 }),
      ];
      renderStep3({ devices });

      // d1 is open by default
      expect(screen.getByTestId("device-open-d1")).toBeInTheDocument();
      expect(screen.getByTestId("device-form-d1")).toBeInTheDocument();
      expect(screen.queryByTestId("device-form-d2")).not.toBeInTheDocument();

      // Click toggle on d2
      fireEvent.click(screen.getByTestId("device-toggle-d2"));

      // d2 should be open, d1 closed
      expect(screen.queryByTestId("device-form-d1")).not.toBeInTheDocument();
      expect(screen.getByTestId("device-form-d2")).toBeInTheDocument();
    });

    it("clicking toggle on open device collapses it", () => {
      renderStep3();
      expect(screen.getByTestId("device-form-dev-1")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("device-toggle-dev-1"));
      expect(
        screen.queryByTestId("device-form-dev-1"),
      ).not.toBeInTheDocument();
    });
  });

  describe("add device", () => {
    it("calls onAddDevice and opens new device", async () => {
      const onAddDevice = vi.fn(async () => "new-id");
      renderStep3({ onAddDevice });

      await fireEvent.click(screen.getByText("Ajouter un défibrillateur"));

      expect(onAddDevice).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove device", () => {
    it("calls onRemoveDevice for non-synced device", () => {
      const devices = [
        makeDevice({ localId: "d1", position: 0 }),
        makeDevice({ localId: "d2", position: 1 }),
      ];
      const onRemoveDevice = vi.fn();
      renderStep3({ devices, onRemoveDevice });

      fireEvent.click(screen.getByTestId("device-delete-d1"));
      expect(onRemoveDevice).toHaveBeenCalledWith("d1");
    });

    it("calls onDeleteSyncedDevice for synced device", () => {
      const devices = [
        makeDevice({ localId: "d1", position: 0 }),
        makeDevice({ localId: "d2", position: 1 }),
      ];
      const onDeleteSyncedDevice = vi.fn();
      renderStep3({
        devices,
        onDeleteSyncedDevice,
        syncedDeviceIds: new Set(["d1"]),
      });

      fireEvent.click(screen.getByTestId("device-delete-d1"));
      expect(onDeleteSyncedDevice).toHaveBeenCalledWith("d1");
    });

    it("does not show delete button when only one active device and not synced", () => {
      renderStep3();
      // canDelete is false (only 1 device), syncedToGeodae is false
      expect(
        screen.queryByTestId("device-delete-dev-1"),
      ).not.toBeInTheDocument();
    });
  });

  describe("deleted devices", () => {
    it("renders deleted devices with strikethrough text and no form", () => {
      const devices = [
        makeDevice({ localId: "d1", nom: "Active DAE", position: 0 }),
        makeDevice({ localId: "d2", nom: "Deleted DAE", position: 1 }),
      ];
      renderStep3({ devices, deletedDeviceIds: new Set(["d2"]) });

      // Active device has normal card
      expect(screen.getByTestId("device-card-d1")).toBeInTheDocument();

      // Deleted device has strikethrough text, no card component
      const deletedText = screen.getByText("Deleted DAE");
      expect(deletedText).toHaveClass("line-through");
      expect(screen.getByText("Supprimé de GéoDAE")).toBeInTheDocument();
      expect(screen.queryByTestId("device-card-d2")).not.toBeInTheDocument();
    });

    it("sorts deleted devices after active ones", () => {
      const devices = [
        makeDevice({ localId: "d-deleted", nom: "Deleted", position: 0 }),
        makeDevice({ localId: "d-active", nom: "Active", position: 1 }),
      ];
      renderStep3({ devices, deletedDeviceIds: new Set(["d-deleted"]) });

      const allItems = screen.getAllByText(/Active|Deleted/);
      // Active should come first in the DOM
      expect(allItems[0]).toHaveTextContent("Active");
      expect(allItems[1]).toHaveTextContent("Deleted");
    });
  });

  describe("synced devices", () => {
    it("passes syncedToGeodae flag to DaeDeviceCard", () => {
      const devices = [
        makeDevice({ localId: "d1", position: 0 }),
        makeDevice({ localId: "d2", position: 1 }),
      ];
      renderStep3({ devices, syncedDeviceIds: new Set(["d1"]) });

      expect(screen.getByTestId("device-synced-d1")).toBeInTheDocument();
      expect(
        screen.queryByTestId("device-synced-d2"),
      ).not.toBeInTheDocument();
    });
  });
});
