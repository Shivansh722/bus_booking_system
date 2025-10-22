"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const BookBusPage = () => {
  const router = useRouter();
  const params = useParams();
  const busId = params.id as string;
  
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<{ seat: number; name: string; phone: string }[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check if the user is authenticated
        const authResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!authResponse.ok) {
          router.push('/user/login');
          return;
        }
        
        setIsAuthenticated(true);
        
        // Fetch bus data
        const busResponse = await fetch(`/api/buses/${busId}`, {
          credentials: 'include',
        });
        
        if (!busResponse.ok) {
          throw new Error('Failed to fetch bus data');
        }
        
        const busData = await busResponse.json();
        setBus(busData);
        
      } catch (error) {
        console.error('Initialization failed:', error);
        alert('Failed to load bus data. Please try again.');
        router.push('/buses');
      } finally {
        setLoading(false);
      }
    };

    if (busId) {
      initializePage();
    }
  }, [router, busId]);

  const handleSeatSelect = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats((prev) => prev.filter((seat) => seat !== seatNumber));
      setPassengerDetails((prev) => prev.filter((detail) => detail.seat !== seatNumber));
    } else {
      setSelectedSeats((prev) => [...prev, seatNumber]);
      setPassengerDetails((prev) => [...prev, { seat: seatNumber, name: '', phone: '' }]);
    }
  };

  const handlePassengerDetailChange = (seat: number, field: 'name' | 'phone', value: string) => {
    setPassengerDetails((prev) =>
      prev.map((detail) =>
        detail.seat === seat ? { ...detail, [field]: value } : detail
      )
    );
  };

  const handleBooking = async () => {
    if (passengerDetails.some((detail) => !detail.name || !detail.phone)) {
      alert('Please fill all the details for each selected seat.');
      return;
    }

    try {
      setIsBooking(true);
      const response = await fetch(`/api/buses/${busId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          seatNumbers: passengerDetails.map((detail) => detail.seat),
          passengers: passengerDetails,
        }),
      });

      if (response.ok) {
        alert('Booking successful!');
        router.push('/tickets');
      } else {
        const error = await response.json();
        alert(error.error || 'Booking failed.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!bus) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Bus not found</p>
      </div>
    );
  }

  const renderSeatLayout = () => {
    if (!bus) return null;
    
    const totalSeats = bus.totalSeats || 40;
    const rows = Math.ceil(totalSeats / 4); // Number of rows in the bus
    const seatsPerRow = 4; // Seats per row (2 on each side of the aisle)
    const seatLayout = [];
    const bookedSeats = bus.bookedSeats || [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < seatsPerRow; j++) {
        const seatNumber = i * seatsPerRow + j + 1;
        if (seatNumber > totalSeats) break;
        
        row.push(
          <button
            key={seatNumber}
            onClick={() => handleSeatSelect(seatNumber)}
            disabled={bookedSeats.includes(seatNumber)}
            style={{
              width: '40px',
              height: '40px',
              margin: '5px',
              backgroundColor: selectedSeats.includes(seatNumber)
                ? '#4CAF50'
                : bookedSeats.includes(seatNumber)
                ? '#FF5252'
                : '#E0E0E0',
              color: selectedSeats.includes(seatNumber) ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: bookedSeats.includes(seatNumber) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {seatNumber}
          </button>
        );
      }
      seatLayout.push(
        <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
          {row.slice(0, 2)}
          <div style={{ width: '20px' }}></div> {/* Aisle */}
          {row.slice(2)}
        </div>
      );
    }

    return seatLayout;
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Book Your Seat</h1>
      
      {/* Bus Information */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{bus.name}</h2>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Route:</strong> {bus.origin} → {bus.destination}
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Bus Number:</strong> {bus.busNumber} | <strong>Operator:</strong> {bus.operator}
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Departure:</strong> {bus.departureTime} | <strong>Arrival:</strong> {bus.arrivalTime}
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Price:</strong> ₹{bus.price} per seat | <strong>Available Seats:</strong> {bus.availableSeats || (bus.totalSeats - (bus.bookedSeats?.length || 0))}
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>{renderSeatLayout()}</div>
      <div style={{ marginBottom: '20px' }}>
        {selectedSeats.map((seat) => (
          <div key={seat} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Seat {seat}:</span>
            <input
              type="text"
              placeholder="Passenger Name"
              value={passengerDetails.find((detail) => detail.seat === seat)?.name || ''}
              onChange={(e) => handlePassengerDetailChange(seat, 'name', e.target.value)}
              style={{ padding: '5px', flex: 1 }}
            />
            <input
              type="text"
              placeholder="Passenger Phone"
              value={passengerDetails.find((detail) => detail.seat === seat)?.phone || ''}
              onChange={(e) => handlePassengerDetailChange(seat, 'phone', e.target.value)}
              style={{ padding: '5px', flex: 1 }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleBooking}
        disabled={isBooking || selectedSeats.length === 0}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {isBooking ? 'Booking...' : 'Book Now'}
      </button>
    </main>
  );
};

export default BookBusPage;