use std::io::Write;

pub struct TeeWriter<E: Write, A: Write> {
    left: E,
    right: A,
}

impl<E: Write, A: Write> TeeWriter<E, A> {
    pub fn new(left: E, right: A) -> Self {
        Self { left, right }
    }

    pub fn into_inner(self) -> (E, A) {
        (self.left, self.right)
    }
}

impl<E: Write, A: Write> Write for TeeWriter<E, A> {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        let ne = self.left.write(&buf[..])?;
        self.right.write_all(&buf[..ne])?;
        Ok(ne)
    }

    fn flush(&mut self) -> std::io::Result<()> {
        self.left.flush()?;
        self.right.flush()
    }
}
