/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license GPLv2
 */

import { resolvePromisesSequentially, matchAtMention, hashString, isInstanceOfOneOf } from "../utility";

describe("resolvePromisesSequentially()", () => {
    it("resolves promises in order", () => {
        const order: number[] = [];

        const func1 = () => {
            order.push(1);
        };
        const func2 = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    order.push(2);
                    resolve();
                }, 50);
            });
        };
        const func3 = () => {
            order.push(3);
        };

        const functions = [func1, func2, func3];
        const expectation = [1, 2, 3];

        expect.assertions(1);

        return resolvePromisesSequentially(functions).then(() => {
            expect(order).toEqual(expectation);
        });
    });

    it("returns all of the results in order", () => {
        const func1 = () => Promise.resolve(1);
        const func2 = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(2);
                }, 50);
            });
        };
        const func3 = () => Promise.resolve(3);

        const functions = [func1, func2, func3];
        const expectation = [1, 2, 3];

        expect.assertions(1);

        return expect(resolvePromisesSequentially(functions)).resolves.toEqual(expectation);
    });

    it("passes the value of one promise to the next", () => {
        const func = prev => (Number.isInteger(prev) ? Promise.resolve(prev + 1) : Promise.resolve(0));
        const functions = [func, func, func];
        const expectation = [0, 1, 2];

        return expect(resolvePromisesSequentially(functions)).resolves.toEqual(expectation);
    });
});

describe("hashString", () => {
    test("the same string always results in the same value", () => {
        const str =
            "a; lksdjfl;aska;lskd fjaskl;dfj al;skdjfalsjkdfa;lksdjfl;kasdjflksaf;kbfjal;skdfbjanv;slkdfjbals;dkjfslkadfj;alsdjf;oiawjef;oiawbejvf;ioawbevf;aoiwebfjaov;wifebvl";
        expect(hashString(str)).toBe(hashString(str));
    });

    test("different strings hash to different values", () => {
        const str1 = "a;slkdfjl;askdjfkl;asdjfkl;asjdfl;";
        const str2 =
            "a;sldkfjal;skdfjl;kasjdfl;k;laksjdf;laksjdf;laksjdf;lkajsd;lkfjaskl;dfjals;kdfjnal;skdjbfl;kasbdjfv;laskjbdfal;skdjfalv;skdjfalskdbjnfav;bslkdfjnalv;ksdfjbalskdfbjalvsk.dfjbalsv;kdbfjalsv;kdfjbadklsfjals";

        expect(hashString(str1)).not.toBe(hashString(str2));
    });
});

test("isInstanceOfOneOf", () => {
    /* tslint:disable:max-classes-per-file */
    class Thing1 {}
    class Thing2 {}
    class Thing3 {}
    class Thing4 {}

    const classes = [Thing1, Thing2, Thing3, Thing4];

    const thing2 = new Thing4();

    expect(isInstanceOfOneOf(thing2, classes)).toBe(true);
    expect(isInstanceOfOneOf(5, classes)).not.toBe(true);
});

function testSubjectsAndMatches(subjectsAndMatches: object) {
    Object.entries(subjectsAndMatches).map(([subject, match]) => {
        test(subject, () => {
            const result = matchAtMention(subject, true);

            if (result === null) {
                expect(result).toBe(match);
            } else {
                expect(result.match).toBe(match);
            }
        });
    });
}

describe("matching @mentions", () => {
    describe("simple mentions", () => {
        const goodSubjects = {
            "@System": "System",
            "Sometext @System": "System",
            "asdfasdf @joe": "joe",
        };

        testSubjectsAndMatches(goodSubjects);
    });

    describe("special characters", () => {
        const goodSubjects = {
            [`@"Séche"`]: "Séche",
            [`Something @"Séche"`]: "Séche",
            [`@"Umuüûū"`]: "Umuüûū",
            [`@Séche`]: "Séche", // Unquoted accent character
            [`@Umuüûū"`]: 'Umuüûū"',
        };

        testSubjectsAndMatches(goodSubjects);
    });

    describe("names with spaces", () => {
        const goodSubjects = {
            [`@"Someon asdf `]: "Someon asdf ",
            [`@"someone with a closed space"`]: "someone with a closed space",
            [`@"What about multiple spaces?      `]: "What about multiple spaces?      ",
        };

        const badSubjects = {
            "@someone with non-wrapped spaces": null,
            "@Some ": null,
        };

        testSubjectsAndMatches(goodSubjects);
        testSubjectsAndMatches(badSubjects);
    });

    describe("Closing characters", () => {
        const goodSubjects = {
            [`@Other Mention at end after linebreak
                @System`]: "System",
            [`
    Newline with special char
                               @"Umuüûū"`]: "Umuüûū",
        };

        const badSubjects = {
            [`@"Close on quote" other thing`]: null,
        };

        testSubjectsAndMatches(goodSubjects);
        testSubjectsAndMatches(badSubjects);
    });
});
