fn main(answer: Field, guess: Field) {
    assert(answer == guess);
}

#[test]
fn test_main() {
    main(1, 2);

    // Uncomment to make test fail
    // main(1, 1);
}
