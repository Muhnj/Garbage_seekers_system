"use client";
import React, { useEffect, useState } from "react";
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
  TablePagination,
} from "@mui/material";
import TableExport from "./exportTable";

const ExportSampleTable = () => {
  const [clients, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Enhanced mock data with multiple entries
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const mockData = [
          {
            id: 1,
            security_code: "SC001",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            client_address: "123 Main St, New York",
          },
          {
            id: 2,
            security_code: "SC002",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            phone: "+1987654321",
            client_address: "456 Oak Ave, Los Angeles",
          },
          {
            id: 3,
            security_code: "SC003",
            firstName: "Robert",
            lastName: "Johnson",
            email: "robert.j@example.com",
            phone: "+1122334455",
            client_address: "789 Pine Rd, Chicago",
          },
          {
            id: 4,
            security_code: "SC004",
            firstName: "Emily",
            lastName: "Williams",
            email: "emily.w@example.com",
            phone: "+5566778899",
            client_address: "321 Elm St, Houston",
          },
          {
            id: 5,
            security_code: "SC005",
            firstName: "Michael",
            lastName: "Brown",
            email: "michael.b@example.com",
            phone: "+4433221100",
            client_address: "654 Maple Dr, Phoenix",
          },
        ];
        setResidents(mockData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Define columns for export
  const exportColumns = [
    { header: "Security Code", accessor: "security_code" },
    { header: "Full Name", accessor: (row) => `${row.firstName} ${row.lastName}` },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Site Location", accessor: "client_address" },
  ];

  // Enhanced search function
  const filteredData = clients.filter((row) => {
    const searchTerm = filter.toLowerCase();
    return (
      row.security_code.toLowerCase().includes(searchTerm) ||
      `${row.firstName} ${row.lastName}`.toLowerCase().includes(searchTerm) ||
      row.email.toLowerCase().includes(searchTerm) ||
      row.phone.includes(filter) || // Keep as-is for number search
      row.client_address.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div>
      <div className="flex justify-between items-center">
        <TextField
          label="Quick Search"
          variant="outlined"
          margin="normal"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="lg:w-72"
          placeholder="Search by name, email, phone..."
        />
        <TableExport
          columns={exportColumns}
          data={filteredData}
          title="Residents List"
          buttonText="Download"
        />
      </div>

      {loading ? (
        <CircularProgress className="mt-4" />
      ) : (
        <>
          <TableContainer component={Paper} className="shadow-lg rounded-lg mt-4">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-200">
                  <TableCell>Security Code</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Site Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.security_code}</TableCell>
                      <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.client_address}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ExportSampleTable;