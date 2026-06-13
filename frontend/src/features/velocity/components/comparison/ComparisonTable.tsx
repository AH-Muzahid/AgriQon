"use client";

import { COMPARISON_ROWS } from "../../data/comparison-content";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function ComparisonTable() {
  return (
    <div className="rounded-xl border border-white/8 bg-[#111214]/35 overflow-hidden backdrop-blur-md">
      <Table>
        <TableHeader className="border-b border-white/8 bg-zinc-950/40">
          <TableRow className="hover:bg-transparent border-b border-white/8">
            <TableHead className="w-1/4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 py-4 pl-6">
              Capability
            </TableHead>
            <TableHead className="w-3/8 text-[10px] font-bold uppercase tracking-wider text-zinc-400 py-4">
              Traditional ERP
            </TableHead>
            <TableHead className="w-3/8 text-[10px] font-bold uppercase tracking-wider text-cyan-400 py-4 pr-6">
              Velocity Operating System
            </TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {COMPARISON_ROWS.map((row, idx) => (
            <TableRow
              key={idx}
              className="border-b border-white/5 hover:bg-white/2 transition-all"
            >
              {/* Capability */}
              <TableCell className="font-semibold text-xs text-white py-4 pl-6">
                {row.feature}
              </TableCell>
              
              {/* Traditional ERP */}
              <TableCell className="py-4 pr-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-650" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-400">{row.traditional}</span>
                    <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">
                      {row.traditionalDetail}
                    </p>
                  </div>
                </div>
              </TableCell>
              
              {/* Velocity */}
              <TableCell className="py-4 pr-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">{row.velocity}</span>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                      {row.velocityDetail}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
