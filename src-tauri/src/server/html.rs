pub fn construct_html(s: &str) -> String {
    if s.ends_with('/') {
        s[..s.len() - 1].to_string()
    } else {
        s.to_string()
    }
}
