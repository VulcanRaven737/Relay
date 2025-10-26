export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_account: {
        Row: {
          user_id: number
          name: string
          email: string
          ph_no: string
        }
        Insert: {
          user_id?: number
          name: string
          email: string
          ph_no: string
        }
        Update: {
          user_id?: number
          name?: string
          email?: string
          ph_no?: string
        }
      }
      vehicle: {
        Row: {
          vehicle_id: number
          user_id: number
          no_plate: string
          maker_model: string
          batteryhealth: string
          connectortype: string
          date_of_purchase: string
          dist_travelled: number
        }
        Insert: {
          vehicle_id?: number
          user_id: number
          no_plate: string
          maker_model: string
          batteryhealth: string
          connectortype: string
          date_of_purchase: string
          dist_travelled?: number
        }
        Update: {
          vehicle_id?: number
          user_id?: number
          no_plate?: string
          maker_model?: string
          batteryhealth?: string
          connectortype?: string
          date_of_purchase?: string
          dist_travelled?: number
        }
      }
      charging_station: {
        Row: {
          station_id: number
          operatorname: string
          location: string
          contact: string
        }
        Insert: {
          station_id?: number
          operatorname: string
          location: string
          contact: string
        }
        Update: {
          station_id?: number
          operatorname?: string
          location?: string
          contact?: string
        }
      }
      charging_port: {
        Row: {
          port_id: number
          station_id: number
          connectortype: string
          status: string
          max_power_output: number
        }
        Insert: {
          port_id?: number
          station_id: number
          connectortype: string
          status: string
          max_power_output: number
        }
        Update: {
          port_id?: number
          station_id?: number
          connectortype?: string
          status?: string
          max_power_output?: number
        }
      }
      charging_session: {
        Row: {
          session_id: number
          user_id: number
          port_id: number
          vehicle_id: number
          start_time: string
          end_time: string | null
          duration: number | null
          energy_consumed: number | null
          cost: number | null
        }
        Insert: {
          session_id?: number
          user_id: number
          port_id: number
          vehicle_id: number
          start_time?: string
          end_time?: string | null
          duration?: number | null
          energy_consumed?: number | null
          cost?: number | null
        }
        Update: {
          session_id?: number
          user_id?: number
          port_id?: number
          vehicle_id?: number
          start_time?: string
          end_time?: string | null
          duration?: number | null
          energy_consumed?: number | null
          cost?: number | null
        }
      }
      payment: {
        Row: {
          pay_id: number
          session_id: number
          pay_status: string
          pay_date: string
          amount: number
          pay_method: string
        }
        Insert: {
          pay_id?: number
          session_id: number
          pay_status: string
          pay_date?: string
          amount: number
          pay_method: string
        }
        Update: {
          pay_id?: number
          session_id?: number
          pay_status?: string
          pay_date?: string
          amount?: number
          pay_method?: string
        }
      }
      review: {
        Row: {
          review_id: number
          user_id: number
          station_id: number
          comments: string
          rating: number
          date: string
        }
        Insert: {
          review_id?: number
          user_id: number
          station_id: number
          comments: string
          rating: number
          date?: string
        }
        Update: {
          review_id?: number
          user_id?: number
          station_id?: number
          comments?: string
          rating?: number
          date?: string
        }
      }
      maintenance_log: {
        Row: {
          log_id: number
          station_id: number
          port_id: number
          issue: string
          maintain_date: string
          fix_date: string | null
          status: string
          technicianname: string
        }
        Insert: {
          log_id?: number
          station_id: number
          port_id: number
          issue: string
          maintain_date?: string
          fix_date?: string | null
          status: string
          technicianname: string
        }
        Update: {
          log_id?: number
          station_id?: number
          port_id?: number
          issue?: string
          maintain_date?: string
          fix_date?: string | null
          status?: string
          technicianname?: string
        }
      }
      port_status_log: {
        Row: {
          log_id: number
          port_id: number
          old_status: string
          new_status: string
          change_timestamp: string
        }
        Insert: {
          log_id?: number
          port_id: number
          old_status: string
          new_status: string
          change_timestamp?: string
        }
        Update: {
          log_id?: number
          port_id?: number
          old_status?: string
          new_status?: string
          change_timestamp?: string
        }
      }
    }
    Functions: {
      calculateusertotalspending: {
        Args: { user_id_input: number }
        Returns: number
      }
      getstationrevenue: {
        Args: { station_id_input: number; start_date: string; end_date: string }
        Returns: number
      }
    }
  }
}
