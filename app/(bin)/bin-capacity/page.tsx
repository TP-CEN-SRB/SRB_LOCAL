import { getBinsByUserId } from "@/app/action/bin";
import ButtonRedirect from "@/components/Button/ButtonRedirect";
import BinCapacityChart from "@/components/Chart/BinCapacityChart";
import { notFound } from "next/navigation";
import React from "react";

const BinCapacityPage = async () => {
  const bins = await getBinsByUserId();
  if ("error" in bins || bins.length === 0) {
    notFound();
  }

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-slate-800 mb-8">Bin Capacity</h1>
      <div
        className="grid place-items-center gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(
            bins.length,
            5
          )}, minmax(150px, 1fr))`,
        }}
      >
        {bins.map((bin, index) => (
          <BinCapacityChart
            key={index}
            currentCapacity={bin.currentCapacity}
            material={bin.binMaterial.name}
            isUnderMaintenance={bin.status == "UNDER_MAINTENANCE"}
          />
        ))}
      </div>
      <ButtonRedirect rounded href="/" variant="outline" color="indigo">
        Back
      </ButtonRedirect>
    </div>
  );
};

export default BinCapacityPage;
