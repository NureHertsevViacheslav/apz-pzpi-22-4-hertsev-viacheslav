package com.example.officespacemobile

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.officespacemobile.databinding.ItemBookingBinding

class BookingAdapter(private val list: List<Booking>) :
    RecyclerView.Adapter<BookingAdapter.BookingViewHolder>() {

    inner class BookingViewHolder(val binding: ItemBookingBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BookingViewHolder {
        val binding = ItemBookingBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return BookingViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BookingViewHolder, position: Int) {
        val booking = list[position]
        holder.binding.tvBookedRoom.text = booking.roomName
        holder.binding.tvBookedSeats.text = "Місць заброньовано: ${booking.seatsBooked}"
        holder.binding.tvBookedDate.text = "Дата: ${booking.date}"
    }

    override fun getItemCount(): Int = list.size
}
