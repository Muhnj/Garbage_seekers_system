"use client";
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  IconButton,
  TablePagination,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { Eye, Trash2, Pencil, Download } from 'lucide-react';
import Link from 'next/link';
import useModalStore from '@/store/modalStore';
import { userManager } from '@/libs/resourceManagement';
import UpdateResidentModal from '../Data Models/updateWeapon';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable separately

const ResidentsTable = () => {
  const [clients, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { openModal } = useModalStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await userManager.getAll();
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let initialNumb = 1;
        const modifiedData = sortedData.map((resident) => {
          return {
            ...resident,
            SN: initialNumb ++,
            fullName: `${resident.firstName} ${resident.lastName}`.toUpperCase(),
          }
        })
        setResidents(modifiedData);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpdate = (id) => {
    openModal(<UpdateResidentModal id={id} />);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Resident?");
    if (confirmDelete) {
      try {
        await userManager.deleteResource(id);
        setResidents((prev) => prev.filter((o) => o.id !== id));
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  // Filter function
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0); // Reset to first page on new search
  };

  // Pagination functions
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export functions
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(row => ({
      'ResidentID': row?.SN,
      'Full Name': `${row?.firstName} ${row?.lastName}`.toUpperCase(),
      'Email': row?.email,
      'Phone': row?.phone,
      'Echo Points': row?.echoPoints || 'N/A',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");
    XLSX.writeFile(workbook, "Residents.xlsx");
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.text('Residents List', 14, 15);
    
    // Prepare data for PDF
    const headers = [['SN', 'Full Name', 'Email', 'Phone', 'Echo Points']];
    const pdfData = filteredData.map(row => [
      row?.SN,
      `${row?.firstName} ${row?.lastName}`.toUpperCase(),
      row?.email,
      row?.phone,
      row?.ecoPoints || 'N/A',
    ]);
    
    // Add table to PDF using the imported autoTable function
    autoTable(doc, {
      head: headers,
      body: pdfData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 184, 134] }
    });
    
    doc.save('Residents.pdf');
    handleExportClose();
  };

  // Data filtering and pagination
  const filteredData = clients.filter((row) =>
    `${row?.firstName} ${row?.lastName}`.toLowerCase().includes(filter.toLowerCase()) ||
    row?.email.toLowerCase().includes(filter.toLowerCase()) ||
    row?.phone.includes(filter)
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center">
        <TextField
          label="Quick Search"
          variant="outlined"
          margin="normal"
          value={filter}
          onChange={handleFilterChange}
          className="lg:w-72"
        />
        <Button
          variant="contained"
          color="success"
          startIcon={<Download size={18} />}
          onClick={handleExportClick}
          sx={{ mt: 2 }}
        >
          Export
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleExportClose}
        >
          <MenuItem onClick={exportToExcel}>Export as Excel</MenuItem>
          <MenuItem onClick={exportToPDF}>Export as PDF</MenuItem>
        </Menu>
      </div>

      {loading ? (
        <div className="flex justify-center items-center mt-4">
          <CircularProgress />
        </div>
      ) : (
        <>
          <TableContainer component={Paper} className="shadow-lg rounded-lg border-t-2 border-t-emerald-500 mt-4">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-200">
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">ResidentID</TableCell>
                  <TableCell className="font-bold text-gray-700">Full Name</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Email</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Phone</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Echo Points</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={row?.id} className="hover:bg-gray-100">
                    <TableCell className="hidden md:table-cell">
                      <Link
                        href={`#`}
                        className="text-emerald-600 hover:underline hover:cursor-pointer"
                      >
                        {row?.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                        {`${row?.firstName.toUpperCase()} ${row?.lastName.toUpperCase()}`}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{row?.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{row?.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{row?.echo}</TableCell>
                    <TableCell className="hidden md:flex gap-2">
                      <IconButton onClick={() => handleUpdate(row?.id)}>
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(row?.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </div>
  );
};

export default ResidentsTable;