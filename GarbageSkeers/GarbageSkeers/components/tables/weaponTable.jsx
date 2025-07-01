'use client';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, CircularProgress, IconButton, TablePagination } from '@mui/material';
import { Eye, Trash2, Pencil } from 'lucide-react';
import useModalStore from '@/store/modalStore';
import { db } from '@/libs/firebase'; // Import Firestore instance
import { collection, onSnapshot } from 'firebase/firestore'; // Import Firestore methods
import AddWeaponModal from '@/components/Data Models/addWeapon';
import UpdateWeaponModal from '@/components/Data Models/updateWeapon';
import Modal from '@/components/Data Models/modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TableExport from '@/components/tables/exportTable';
import { useFilterStore } from '@/store/filterStore';
import { pickupsManager } from '@/libs/resourceManagement';

export default function WeaponInventoryPage({ filterValue}) {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { openModal } = useModalStore();
  const { pickupFilter } = useFilterStore();

  useEffect(() => {
    // Real-time listener for Firestore collection
    const fetchData = async () => {
        try {
          const pickupsData = await pickupsManager.getAll();
          console.log(pickupsData);
  
          const modifiedData = pickupsData.map((pickup) => {
              return {
            ...pickup,
            collectorName: `${pickup?.collectorName}`.toUpperCase(),
            contactPerson: `${pickup?.contactPerson}`.toUpperCase(),
            garbageType: `${pickup?.garbageType}`.toUpperCase(),
            totalPrice: `UGX. ${pickup.totalPrice}`
          }
          })

          console.log(modifiedData);
  
          if(pickupFilter === 'all') {
            setPickups(modifiedData);
          }
          else if (pickupFilter === 'pending') {
            setPickups(modifiedData.filter(pickup => pickup.status === 'pending'));
          }
          else if (pickupFilter === 'completed') {
            setPickups(modifiedData.filter(pickup => pickup.status === 'completed'));
          }
          else if (pickupFilter === 'cancelled') {
            setPickups(modifiedData.filter(pickup => pickup.status === 'cancelled'));
          }
          else{
            setPickups(modifiedData);
          }
          
          setLoading(false);
          toast.success('Pickups data updated in real-time!'); // Success toast
        } catch (error) {
          toast.error('Error Fetching pickups', error.message)
        }
  }

    // Cleanup listener on component unmount
    fetchData();
  }, []);

  const getTitle = (filter) => {
    if(filter === 'completed'){
      return 'Completed Pickups List'
    }
    else if(filter === 'pending'){
      return 'Pending Pickups List'
    }
    else if(filter === 'Cancelled'){
      return 'Cancelled Pickups List'
    }
    else{
      return 'Pickups List'
    }
  }

  const handleUpdate = (id) => {
    openModal(<UpdateWeaponModal id={id} />);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this weapon?');
    if (confirmDelete) {
      try {
        // Add your delete logic here
        toast.success('Weapon deleted successfully.'); // Success toast
      } catch (error) {
        console.error('Failed to delete weapon:', error);
        toast.error('Failed to delete weapon.'); // Error toast
      }
    }
  };

  const handleOpenModal = () => {
    openModal(<AddWeaponModal />);
    toast.info('Add Weapon Modal opened.'); // Info toast
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

  const filteredData = pickups.filter((row) =>
    `${row.collectorName} ${row.garbageType}`.toLowerCase().includes(filter.toLowerCase()) ||
    row.status.toLowerCase().includes(filter.toLowerCase())
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="max-w-screen-xl mx-auto pt-4">

      {/* Search Input */}
      <div className='flex justify-between items-center mb-4'>
        <TextField
          label="Search Pickups"
          variant="outlined"
          fullWidth
          margin="normal"
          value={filter}
          onChange={handleFilterChange}
          className="lg:w-72"
        />

        <TableExport
          data={pickups}
          columns={[
            { header: 'Pickup Number', accessor: 'id' },
            { header: 'Garbage Type', accessor: 'garbageType' },
            { header: 'Sacks', accessor: 'sackCount' },
            { header: 'Total Price', accessor: 'totalPrice' },
            { header: 'Assigned to', accessor: 'collectorName' },
            { header: 'Ordered By', accessor: 'contactPerson' },
            { header: 'Contact', accessor: 'phone' },
            { header: 'Date', accessor: 'createAt' },
          ]}
          title={()=> getTitle()}
          buttonText='Export'
          className="mb-4"
          />
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center mt-4">
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* Table for Displaying Pickups */}
          <TableContainer component={Paper} className="shadow-lg rounded-lg mt-4">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-200">
                  <TableCell className="font-bold text-gray-700">PickupID</TableCell>
                  <TableCell className="font-bold text-gray-700">Garbage Type</TableCell>
                  <TableCell className="font-bold text-gray-700">Sacks</TableCell>
                  <TableCell className="font-bold text-gray-700">Total Price</TableCell>
                  <TableCell className="font-bold text-gray-700">Assigned To</TableCell>
                  <TableCell className="font-bold text-gray-700">Created By</TableCell>
                  <TableCell className="font-bold text-gray-700">Created At</TableCell>
                  {/* <TableCell className="font-bold text-gray-700">Actions</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-100">
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.garbageType}</TableCell>
                    <TableCell>{row.sackCount}</TableCell>
                    <TableCell>{row.totalPrice}</TableCell>
                    <TableCell>{row.collectorName}</TableCell>
                    <TableCell>{row.contactPerson || row.phone}</TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    {/* <TableCell className="flex gap-2">
                      <IconButton onClick={() => handleUpdate(row.id)}>
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(row.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                      <IconButton>
                        <Eye size={18} />
                      </IconButton>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
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

      {/* Modal Component */}
      <Modal />
    </div>
  );
}
