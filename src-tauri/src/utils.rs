use chrono::{DateTime, Local, Utc};
use std::time::SystemTime;
use std::result::Result;

pub fn format_time(result: Result<SystemTime, std::io::Error>) -> String {
    match result {
        Ok(system_time) => {
            // Convert SystemTime to DateTime<Utc>
            let datetime: DateTime<Utc> = system_time.into();

            // Convert to local time
            let local_datetime: DateTime<Local> = datetime.with_timezone(&Local);

            // Format the date as "Sep 24 at 16:45"
            local_datetime.format("%b %d at %H:%M").to_string()
        }
        Err(_) => String::new(),
    }
}
