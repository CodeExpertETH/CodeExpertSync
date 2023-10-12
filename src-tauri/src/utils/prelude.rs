use crate::utils::prelude::Either::{Left, Right};
use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};

pub trait Traversable<T> {
    type Output<U>;

    fn traverse<U, G, F: FnOnce(T) -> Result<U, G>>(self, op: F) -> Result<Self::Output<U>, G>;
}

impl<T, E> Traversable<T> for Result<T, E> {
    type Output<U> = Result<U, E>;

    fn traverse<U, G, F: FnOnce(T) -> Result<U, G>>(self, op: F) -> Result<Result<U, E>, G> {
        match self {
            Err(e) => Ok(Err(e)),
            Ok(t) => op(t).map(|u| Ok(u)),
        }
    }
}

#[derive(Debug, PartialEq)]
pub enum Either<E, A> {
    Left(E),
    Right(A),
}

impl<E, A> From<Result<A, E>> for Either<E, A> {
    fn from(value: Result<A, E>) -> Self {
        match value {
            Ok(a) => Right(a),
            Err(e) => Left(e),
        }
    }
}

impl<E: Serialize, A: Serialize> Serialize for Either<E, A> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("Either", 2)?;
        match self {
            Left(e) => {
                state.serialize_field("_tag", "Left")?;
                state.serialize_field("left", e)?;
            }
            Right(a) => {
                state.serialize_field("_tag", "Right")?;
                state.serialize_field("right", a)?;
            }
        }
        state.end()
    }
}
