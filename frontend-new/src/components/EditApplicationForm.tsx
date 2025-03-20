"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  date: string;
  landPlotNo: string;
  borrowerName: string;
  ownerName: string;
  locationCoordinate: string;
  totalAreaLalpurja: string;
  totalAreaActual: string;
  deductionROW: string;
  areaForValuation: string;
  claimantPeriod: string;
  frontage: string;
  shape: string;
  physicalFeature: string;
  row: string;
  commercialRate: string;
  governmentRate: string;
  accessWidthField: string;
  accessWidthBlueprint: string;
  buildingDetails: string;
  fairMarketValueLand: number;
  fairMarketValueBuilding: number;
  fairMarketValueTotal: number;
  distressValueLand: number;
  distressValueBuilding: number;
  distressValueTotal: number;
  bankName?: string;
  bankBranch?: string;
  bankAddress?: string;
  summary?: string;
  letter?: string;
  acceptance?: string;
  legalAspect?: string;
  buildingDetailsExtended?: {
    type?: string;
    age?: string;
    condition?: string;
    specifications?: string;
  };
  methodOfValuation?: string;
  assumptions?: string;
  observations?: string;
}

interface Props {
  applicationId: string;
}

export default function EditApplicationForm({ applicationId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    landPlotNo: "",
    borrowerName: "",
    ownerName: "",
    locationCoordinate: "",
    totalAreaLalpurja: "",
    totalAreaActual: "",
    deductionROW: "",
    areaForValuation: "",
    claimantPeriod: "",
    frontage: "",
    shape: "",
    physicalFeature: "",
    row: "",
    commercialRate: "",
    governmentRate: "",
    accessWidthField: "",
    accessWidthBlueprint: "",
    buildingDetails: "",
    fairMarketValueLand: 0,
    fairMarketValueBuilding: 0,
    fairMarketValueTotal: 0,
    distressValueLand: 0,
    distressValueBuilding: 0,
    distressValueTotal: 0,
    bankName: "",
    bankBranch: "",
    bankAddress: "",
    summary: "",
    letter: "",
    acceptance: "",
    legalAspect: "",
    buildingDetailsExtended: {
      type: "",
      age: "",
      condition: "",
      specifications: "",
    },
    methodOfValuation: "",
    assumptions: "",
    observations: "",
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `https://ajima-design.onrender.com/api/applications/${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch application details");
        }

        const data = await response.json();
        setFormData({
          date: data.date.split("T")[0],
          landPlotNo: data.landPlotNo || "",
          borrowerName: data.borrowerName || "",
          ownerName: data.ownerName || "",
          locationCoordinate: data.locationCoordinate || "",
          totalAreaLalpurja: data.totalAreaLalpurja || "",
          totalAreaActual: data.totalAreaActual || "",
          deductionROW: data.deductionROW || "",
          areaForValuation: data.areaForValuation || "",
          claimantPeriod: data.claimantPeriod || "",
          frontage: data.frontage || "",
          shape: data.shape || "",
          physicalFeature: data.physicalFeature || "",
          row: data.row || "",
          commercialRate: data.commercialRate || "",
          governmentRate: data.governmentRate || "",
          accessWidthField: data.accessWidthField || "",
          accessWidthBlueprint: data.accessWidthBlueprint || "",
          buildingDetails: data.buildingDetails || "",
          fairMarketValueLand: data.fairMarketValueLand || 0,
          fairMarketValueBuilding: data.fairMarketValueBuilding || 0,
          fairMarketValueTotal: data.fairMarketValueTotal || 0,
          distressValueLand: data.distressValueLand || 0,
          distressValueBuilding: data.distressValueBuilding || 0,
          distressValueTotal: data.distressValueTotal || 0,
          bankName: data.bankName || "",
          bankBranch: data.bankBranch || "",
          bankAddress: data.bankAddress || "",
          summary: data.summary || "",
          letter: data.letter || "",
          acceptance: data.acceptance || "",
          legalAspect: data.legalAspect || "",
          buildingDetailsExtended: {
            type: data.buildingDetailsExtended?.type || "",
            age: data.buildingDetailsExtended?.age || "",
            condition: data.buildingDetailsExtended?.condition || "",
            specifications: data.buildingDetailsExtended?.specifications || "",
          },
          methodOfValuation: data.methodOfValuation || "",
          assumptions: data.assumptions || "",
          observations: data.observations || "",
        });
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching application:", err);
        setError(err.message || "Failed to load application data");
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        if (parent === "buildingDetailsExtended" && newData.buildingDetailsExtended) {
          newData.buildingDetailsExtended = {
            ...newData.buildingDetailsExtended,
            [child]: value
          };
        }
      } else {
        const numericFields = [
          'fairMarketValueLand',
          'fairMarketValueBuilding',
          'fairMarketValueTotal',
          'distressValueLand',
          'distressValueBuilding',
          'distressValueTotal'
        ];
        
        if (numericFields.includes(name)) {
          (newData as any)[name] = parseFloat(value) || 0;
        } else {
          (newData as any)[name] = value;
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `https://ajima-design.onrender.com/api/applications/${applicationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      router.push(`/dashboard/applications/${applicationId}`);
    } catch (err: any) {
      console.error("Error updating application:", err);
      setError(err.message || "Failed to update application");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading application data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Edit Valuation Report</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Land Plot No</label>
          <input
            type="text"
            name="landPlotNo"
            value={formData.landPlotNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Borrower Name</label>
          <input
            type="text"
            name="borrowerName"
            value={formData.borrowerName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Owner Name</label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location Coordinate</label>
          <input
            type="text"
            name="locationCoordinate"
            value={formData.locationCoordinate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total Area (Lalpurja)</label>
          <input
            type="text"
            name="totalAreaLalpurja"
            value={formData.totalAreaLalpurja}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total Area (Actual)</label>
          <input
            type="text"
            name="totalAreaActual"
            value={formData.totalAreaActual}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Deduction ROW</label>
          <input
            type="text"
            name="deductionROW"
            value={formData.deductionROW}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Area for Valuation</label>
          <input
            type="text"
            name="areaForValuation"
            value={formData.areaForValuation}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Branch</label>
          <input
            type="text"
            name="bankBranch"
            value={formData.bankBranch}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bank Address</label>
          <input
            type="text"
            name="bankAddress"
            value={formData.bankAddress}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Letter</label>
          <textarea
            name="letter"
            value={formData.letter}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Legal Aspect</label>
          <textarea
            name="legalAspect"
            value={formData.legalAspect}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fairMarketValueLand" className="block text-sm font-medium text-gray-700">
            Fair Market Value (Land)
          </label>
          <input
            type="number"
            name="fairMarketValueLand"
            id="fairMarketValueLand"
            value={formData.fairMarketValueLand}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="fairMarketValueBuilding" className="block text-sm font-medium text-gray-700">
            Fair Market Value (Building)
          </label>
          <input
            type="number"
            name="fairMarketValueBuilding"
            id="fairMarketValueBuilding"
            value={formData.fairMarketValueBuilding}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="fairMarketValueTotal" className="block text-sm font-medium text-gray-700">
            Fair Market Value (Total)
          </label>
          <input
            type="number"
            name="fairMarketValueTotal"
            id="fairMarketValueTotal"
            value={formData.fairMarketValueTotal}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="distressValueLand" className="block text-sm font-medium text-gray-700">
            Distress Value (Land)
          </label>
          <input
            type="number"
            name="distressValueLand"
            id="distressValueLand"
            value={formData.distressValueLand}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="distressValueBuilding" className="block text-sm font-medium text-gray-700">
            Distress Value (Building)
          </label>
          <input
            type="number"
            name="distressValueBuilding"
            id="distressValueBuilding"
            value={formData.distressValueBuilding}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="distressValueTotal" className="block text-sm font-medium text-gray-700">
            Distress Value (Total)
          </label>
          <input
            type="number"
            name="distressValueTotal"
            id="distressValueTotal"
            value={formData.distressValueTotal}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
