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
} from '@mui/material';

import { Eye, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import useModalStore from '@/store/modalStore';
import UpdateCollectorModal from '../Data Models/updateOfficer';
import TableExport from './exportTable';
import { collectorManager } from '@/libs/resourceManagement';
import { useRouter } from 'next/navigation';

const MyTable = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { openModal } = useModalStore();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await collectorManager.getAll();

      const modifiedData = data.map((collector) => {
        return {
          ...collector,
          fullName: `${collector.firstName} ${collector.lastName}`.toUpperCase(),
        };
      });
      const sortedData = modifiedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCollectors(sortedData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleUpdate = (id) => {
    openModal(<UpdateCollectorModal id={id} />);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this collector?");
    if (confirmDelete) {
      try {
        await collectorManager.deleteResource(id);
        setCollectors((prev) => prev.filter((o) => o.id !== id));
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0); // Reset to first page on new search
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = collectors.filter((row) =>
    `${row.firstName} ${row.lastName}`.toLowerCase().includes(filter.toLowerCase()) ||
    row.email.toLowerCase().includes(filter.toLowerCase()) ||
    row.phone.includes(filter)
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
        <TextField
          label="Quick Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={filter}
          onChange={handleFilterChange}
          className="lg:w-72"
        />
        <TableExport 
          data={filteredData}
          title={`Garbage Collectors Information`}
          columns={[
            { header: 'First Name', accessor: `firstName` },
            { header: 'Last Name', accessor: 'lastName' },
            { header: 'Email', accessor: 'email' },
            { header: 'Phone', accessor: 'phone' },
            { header: 'Residence', accessor: `equipmentType` },
            { header: 'Status', accessor: 'status' },
          ]}
          buttonText="Export"
        />
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
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">CollectorID</TableCell>
                  <TableCell className="font-bold text-gray-700">Full Name</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Email</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Phone</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Collection Method</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Status</TableCell>
                  <TableCell className="font-bold text-gray-700 hidden md:table-cell">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-gray-100">
                    <TableCell className="hidden md:table-cell">
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/collectors/overview/${row.id}`}>
                        {row.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{row.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{row.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{row.equipmentType.toUpperCase()}</TableCell>
                    <TableCell className="hidden md:table-cell">{row.status === "verified" ? 'Verified' : 'Not Verified'}</TableCell>
                    <TableCell className="hidden md:flex gap-2">
                      <IconButton onClick={() => handleUpdate(row.id)}>
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(row.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                      <IconButton onClick={() => router.push(`/dashboard/collectors/overview/${row.id}`)}>
                        <Eye size={18} />
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

export default MyTable;
