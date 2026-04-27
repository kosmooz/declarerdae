import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { DeclarationFormState } from "@/lib/declaration-types";
import { INITIAL_FORM_DATA, TYPE_ERP_OPTIONS } from "@/lib/declaration-types";

// --- Mocks ---

let capturedMapProps: any = {};

vi.mock("@/components/declarerdae/declaration/shared/SiteLocationMap", () => ({
  default: (props: any) => {
    capturedMapProps = props;
    return (
      <div data-testid="site-location-map">
        <span data-testid="map-lat">{props.lat}</span>
        <span data-testid="map-lng">{props.lng}</span>
      </div>
    );
  },
}));

vi.mock("@/components/declarerdae/declaration/shared/PhonePrefixSelect", () => ({
  default: ({ value, onChange, className }: any) => (
    <button
      data-testid={`phone-prefix-${value}`}
      className={className}
      onClick={() => onChange("gp")}
    >
      +{value}
    </button>
  ),
}));

vi.mock("@/data/phone-prefixes", () => ({
  default: [],
  PRIORITY_CODES: [],
  getPhonePlaceholder: () => "612345678",
}));

// Import after mocks
import Step2 from "@/components/declarerdae/declaration/steps/Step2SiteLocalisation";

// --- Helpers ---

function makeData(
  overrides: Partial<DeclarationFormState> = {},
): DeclarationFormState {
  return { ...INITIAL_FORM_DATA, ...overrides };
}

function renderStep2(
  dataOverrides: Partial<DeclarationFormState> = {},
  onChange = vi.fn(),
  onBatchChange = vi.fn(),
) {
  const data = makeData(dataOverrides);
  return {
    ...render(
      <Step2 data={data} onChange={onChange} onBatchChange={onBatchChange} />,
    ),
    onChange,
    onBatchChange,
    data,
  };
}

// --- Tests ---

describe("Step2SiteLocalisation", () => {
  describe("rendering", () => {
    it("renders the title and description", () => {
      renderStep2();
      expect(screen.getByText("Site d'implantation")).toBeInTheDocument();
      expect(
        screen.getByText(/Localisation du site où sont installés/),
      ).toBeInTheDocument();
    });

    it("renders the contact section", () => {
      renderStep2();
      expect(screen.getByText("Contact sur le site")).toBeInTheDocument();
    });
  });

  describe("establishment fields", () => {
    it("renders establishment name input and fires onChange", () => {
      const onChange = vi.fn();
      renderStep2({}, onChange);

      const input = screen.getByLabelText("Nom de l'établissement");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute(
        "placeholder",
        "Mairie de Paris, Centre commercial...",
      );

      fireEvent.change(input, { target: { value: "Mairie de Lyon" } });
      expect(onChange).toHaveBeenCalledWith(
        "nomEtablissement",
        "Mairie de Lyon",
      );
    });

    it("displays existing establishment name", () => {
      renderStep2({ nomEtablissement: "Hôpital Saint-Louis" });
      expect(
        screen.getByDisplayValue("Hôpital Saint-Louis"),
      ).toBeInTheDocument();
    });

    it("renders ERP type select with all options", () => {
      renderStep2();
      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("SiteLocationMap integration", () => {
    it("passes correct props to SiteLocationMap", () => {
      const onBatchChange = vi.fn();
      renderStep2(
        {
          latCoor1: 48.8566,
          longCoor1: 2.3522,
          adrNum: "10",
          adrVoie: "Rue de Rivoli",
          adrComplement: "Bât A",
          codePostal: "75001",
          codeInsee: "75101",
          ville: "Paris",
        },
        vi.fn(),
        onBatchChange,
      );

      expect(screen.getByTestId("site-location-map")).toBeInTheDocument();
      expect(capturedMapProps.lat).toBe(48.8566);
      expect(capturedMapProps.lng).toBe(2.3522);
      expect(capturedMapProps.adrNum).toBe("10");
      expect(capturedMapProps.adrVoie).toBe("Rue de Rivoli");
      expect(capturedMapProps.codePostal).toBe("75001");
      expect(capturedMapProps.ville).toBe("Paris");
      expect(capturedMapProps.onBatchChange).toBe(onBatchChange);
    });

    it("renders map with null coords for empty data", () => {
      renderStep2();
      expect(capturedMapProps.lat).toBeNull();
      expect(capturedMapProps.lng).toBeNull();
    });
  });

  describe("contact fields", () => {
    it("renders phone 1 input and fires onChange on typing", () => {
      const onChange = vi.fn();
      renderStep2({}, onChange);

      const tel1 = screen.getByLabelText(/Téléphone sur site/);
      expect(tel1).toBeInTheDocument();
      expect(tel1).toHaveAttribute("aria-required", "true");

      fireEvent.change(tel1, { target: { value: "612345678" } });
      expect(onChange).toHaveBeenCalledWith("tel1", "612345678");
    });

    it("renders phone 2 input and fires onChange", () => {
      const onChange = vi.fn();
      renderStep2({}, onChange);

      const tel2 = screen.getByLabelText(/Téléphone 2/);
      expect(tel2).toBeInTheDocument();

      fireEvent.change(tel2, { target: { value: "698765432" } });
      expect(onChange).toHaveBeenCalledWith("tel2", "698765432");
    });

    it("renders site email input and fires onChange", () => {
      const onChange = vi.fn();
      renderStep2({}, onChange);

      const email = screen.getByLabelText(/Email du site/);
      expect(email).toBeInTheDocument();

      fireEvent.change(email, { target: { value: "accueil@mairie.fr" } });
      expect(onChange).toHaveBeenCalledWith("siteEmail", "accueil@mairie.fr");
    });

    it("displays existing contact data", () => {
      renderStep2({
        tel1: "612345678",
        tel2: "698765432",
        siteEmail: "site@test.fr",
      });
      expect(screen.getByDisplayValue("612345678")).toBeInTheDocument();
      expect(screen.getByDisplayValue("698765432")).toBeInTheDocument();
      expect(screen.getByDisplayValue("site@test.fr")).toBeInTheDocument();
    });

    it("phone prefix buttons call onChange with prefix field", () => {
      const onChange = vi.fn();
      // Use different prefixes so testids are unique
      renderStep2({ tel1Prefix: "fr", tel2Prefix: "re" }, onChange);

      fireEvent.click(screen.getByTestId("phone-prefix-fr"));
      expect(onChange).toHaveBeenCalledWith("tel1Prefix", "gp");

      fireEvent.click(screen.getByTestId("phone-prefix-re"));
      expect(onChange).toHaveBeenCalledWith("tel2Prefix", "gp");
    });
  });
});
