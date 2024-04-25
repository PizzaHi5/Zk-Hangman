fn main(answer: Field, guess: pub Field) {
    assert(answer == guess);
}

#[test]
fn test_main() {
    main(1, 1);

    // Uncomment to make test fail
    // main(1, 1);
}
