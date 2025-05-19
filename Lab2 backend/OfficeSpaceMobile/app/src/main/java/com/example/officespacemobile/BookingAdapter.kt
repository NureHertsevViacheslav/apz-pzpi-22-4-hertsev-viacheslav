package com.example.officespacemobile

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.example.officespacemobile.databinding.ItemBookingBinding
import okhttp3.*
import java.io.IOException

class BookingAdapter(
    private val list: List<Booking>,
    private val rooms: List<Room>
) : RecyclerView.Adapter<BookingAdapter.BookingViewHolder>() {

    inner class BookingViewHolder(val binding: ItemBookingBinding) :
        RecyclerView.ViewHolder(binding.root)

    private val client = OkHttpClient()
    private val apiUrl = "http://10.0.2.2:3000/api/bookings"

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BookingViewHolder {
        val binding = ItemBookingBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return BookingViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BookingViewHolder, position: Int) {
        val booking = list[position]
        val roomName = rooms.find { it.id == booking.room_id }?.name ?: "???"

        holder.binding.tvBookedRoom.text = roomName
        holder.binding.tvBookedSeats.text = "Місць заброньовано: ${booking.seats}"
        holder.binding.tvBookedDate.text = "З ${booking.start_date} до ${booking.end_date}"

        holder.binding.btnDeleteBooking.setOnClickListener {
            deleteBooking(booking.id, holder)
        }
    }

    override fun getItemCount(): Int = list.size

    private fun deleteBooking(bookingId: Int, holder: BookingViewHolder) {
        val context = holder.itemView.context
        val request = Request.Builder()
            .url("$apiUrl/$bookingId")
            .delete()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                (context as? MyBookingsActivity)?.runOnUiThread {
                    Toast.makeText(context, "Помилка видалення", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                (context as? MyBookingsActivity)?.runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(context, "Бронювання видалено", Toast.LENGTH_SHORT).show()
                        context.recreate()  // перезавантажити активність
                    } else {
                        Toast.makeText(context, "Помилка: ${response.code}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }
}
