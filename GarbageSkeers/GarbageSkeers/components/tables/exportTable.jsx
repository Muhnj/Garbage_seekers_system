"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { Button, Menu, MenuItem } from "@mui/material";

/**
 * TableExport Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column definitions for export (header & accessor)
 * @param {Array} props.data - The data to export (should match column accessors)
 * @param {string} props.title - Title for the exported document
 * @param {string} [props.buttonText="Export"] - Text for the export button
 * @param {string} [props.buttonVariant="contained"] - MUI Button variant
 * @param {string} [props.buttonColor="success"] - MUI Button color
 * @returns {JSX.Element} Export button with dropdown menu
 */
const TableExport = ({
  columns,
  data,
  title,
  buttonText = "Export",
  buttonVariant = "contained",
  buttonColor = "success",
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  /**
   * Opens the export menu
   * @param {Event} event - Click event
   */
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /** Closes the export menu */
  const handleExportClose = () => {
    setAnchorEl(null);
  };

  /**
   * Exports data to Excel (XLSX)
   */
  const exportToExcel = () => {
    try {
      const worksheetData = data.map((row) => {
        const obj = {};
        columns.forEach((col) => {
          obj[col.header] = typeof col.accessor === "function" 
            ? col.accessor(row) 
            : row[col.accessor];
        });
        return obj;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);
      XLSX.writeFile(workbook, `${title}.xlsx`);
      handleExportClose();
    } catch (error) {
      console.error("Excel export failed:", error);
    }
  };

  /**
   * Exports data to PDF
   */
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text(title, 14, 15); // Add title

      // Prepare headers and data
      const headers = [columns.map((col) => col.header)];
      const pdfData = data.map((row) =>
        columns.map((col) =>
          typeof col.accessor === "function" 
            ? col.accessor(row) 
            : row[col.accessor]
        )
      );

      // Generate table
      autoTable(doc, {
        head: headers,
        body: pdfData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [40, 184, 134] }, // Blue header
      });

      doc.save(`${title}.pdf`);
      handleExportClose();
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        color={buttonColor}
        startIcon={<Download size={18} />}
        onClick={handleExportClick}
        sx={{ mt: 2 }}
      >
        {buttonText}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleExportClose}
      >
        <MenuItem onClick={exportToExcel}>Export as Excel (.xlsx)</MenuItem>
        <MenuItem onClick={exportToPDF}>Export as PDF (.pdf)</MenuItem>
      </Menu>
    </>
  );
};

export default TableExport;