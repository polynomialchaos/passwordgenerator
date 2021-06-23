// MIT License
//
// Copyright (c) 2021 Florian
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Constant variable definitions
const def_segments = 3;
const def_length = 6;
const def_letter = true;
const def_digit = true;
const def_punctuation = false;
const def_additional = '!§$%&?';
const def_forbidden = '°^\\';

const letters_lowercase = 'abcdefghijklmnopqrstuvwxyz';
const letters_uppercase = letters_lowercase.toUpperCase();
const letters = letters_lowercase.concat(letters_uppercase).split('');
const digits = unique_array('0123456789'.split(''));
const punctuation = unique_array('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split(''));
const delimiter = '-';

// Return a new array, containing only unique elments
function unique_array(a) {
    return [...new Set(a)];
}

// Return a randomly selected element from a given array
function random_choice(a) {
    return a[Math.floor(Math.random() * a.length)];
}

// Return a new array with randomly selected elements
function random_choices(a, length) {
    result = [];
    for (let i = 0; i < length; i++) {
        result.push(random_choice(a));
    }

    return result;
}

// Get the defined user language
function get_user_language() {
    var available = ["de", "en"];

    var locale = [
        ...(window.navigator.languages || []),
        window.navigator.language,
        window.navigator.browserLanguage,
        window.navigator.userLanguage,
        window.navigator.systemLanguage
    ]
        .filter(Boolean)
        .map(language => language.substr(0, 2))
        .find(language => available.includes(language)) || "en";

    return locale
}

// Load a JSON File asynchronous
function loadJSON(path, callback) {
    var xobj = new XMLHttpRequest();

    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

// Initialize the password generator script
function generate_password_init() {
    // get the ID's of the page
    const id_segments = document.getElementById('id_segments');
    const id_segments_value = document.getElementById('id_segments_value');
    const id_length = document.getElementById('id_length');
    const id_length_value = document.getElementById('id_length_value');
    const id_letter = document.getElementById('id_letter');
    const id_digit = document.getElementById('id_digit');
    const id_punctuation = document.getElementById('id_punctuation');
    const id_additional = document.getElementById('id_additional');
    const id_forbidden = document.getElementById('id_forbidden');
    const id_password = document.getElementById('id_password');
    const id_generate = document.getElementById('id_generate');
    const id_reset = document.getElementById('id_reset');

    id_segments.addEventListener('input', update_user_interface);
    id_length.addEventListener('input', update_user_interface);

    id_segments.addEventListener('change', generate_password);
    id_length.addEventListener('change', generate_password);
    id_letter.addEventListener('change', generate_password);
    id_digit.addEventListener('change', generate_password);
    id_punctuation.addEventListener('change', generate_password);
    id_additional.addEventListener('change', generate_password);
    id_forbidden.addEventListener('change', generate_password);

    id_generate.addEventListener('click', generate_password);
    id_reset.addEventListener('click', function (result) {
        id_segments.value = def_segments;
        id_length.value = def_length;
        id_letter.checked = def_letter;
        id_digit.checked = def_digit;
        id_punctuation.checked = def_punctuation;
        id_additional.value = def_additional;
        id_forbidden.value = def_forbidden;

        update_user_interface();
        generate_password()
    });

    loadJSON('/language/' + get_user_language() + '.json', function (response) {
        const id_title = document.getElementById('id_title');
        const id_segments_label = document.getElementById('id_segments_label');
        const id_length_label = document.getElementById('id_length_label');
        const id_letter_label = document.getElementById('id_letter_label');
        const id_digit_label = document.getElementById('id_digit_label');
        const id_punctuation_label = document.getElementById('id_punctuation_label');
        const id_additional_label = document.getElementById('id_additional_label');
        const id_forbidden_label = document.getElementById('id_forbidden_label');
        const id_password_label = document.getElementById('id_password_label');

        data = JSON.parse(response)
        id_title.innerHTML = data['title'];
        id_segments_label.innerHTML = data['segments'];
        id_length_label.innerHTML = data['length'];
        id_letter_label.innerHTML = data['letter'];
        id_digit_label.innerHTML = data['digit'];
        id_punctuation_label.innerHTML = data['punctuation'];
        id_additional_label.innerHTML = data['additional'];
        id_forbidden_label.innerHTML = data['forbidden'];
        id_password_label.innerHTML = data['password'];
        id_generate.innerHTML = data['generate'];
        id_reset.innerHTML = data['reset'];
    });

    // Load/default user interface values (base on user selections)
    chrome.storage.local.get(['id_segments', 'id_length', 'id_letter',
        'id_digit', 'id_punctuation', 'id_additional', 'id_forbidden'], function (result) {
            id_segments.value = (result.id_segments != null) ? result.id_segments : def_segments;
            id_length.value = (result.id_length != null) ? result.id_length : def_length;
            id_letter.checked = (result.id_letter != null) ? result.id_letter : def_letter;
            id_digit.checked = (result.id_digit != null) ? result.id_digit : def_digit;
            id_punctuation.checked = (result.id_punctuation != null) ? result.id_punctuation : def_punctuation;
            id_additional.value = (result.id_additional != null) ? result.id_additional : def_additional;
            id_forbidden.value = (result.id_forbidden != null) ? result.id_forbidden : def_forbidden;

            update_user_interface();
            generate_password()
        }
    )

    // Update user interface values (based on user selections)
    function update_user_interface() {
        id_segments_value.innerHTML = id_segments.value;
        id_length_value.innerHTML = id_length.value;

        // val = String(id_segments.value * id_length.value + 1) + 'ch';
        // id_additional.style.width = val;
        // id_forbidden.style.width = val;
        // id_password.style.width = val;
    }

    // Store user interface values
    function store_user_interface() {
        // store the values
        chrome.storage.local.set({
            'id_segments': id_segments.value,
            'id_length': id_length.value,
            'id_letter': id_letter.checked,
            'id_digit': id_digit.checked,
            'id_punctuation': id_punctuation.checked,
            'id_additional': id_additional.value,
            'id_forbidden': id_forbidden.value
        });
    }

    // Generate a password based on user interface values
    function generate_password() {
        // define the array of valid chars for password generation
        valid_chars = [];
        if (id_letter.checked) valid_chars.push(...letters);
        if (id_digit.checked) valid_chars.push(...digits);
        if (id_punctuation.checked) valid_chars.push(...punctuation);
        if (id_additional.value) valid_chars.push(...id_additional.value.split(''));

        if (id_forbidden.value) {
            for (const f of id_forbidden.value.split('')) {
                const index = valid_chars.indexOf(f);
                if (index > -1) {
                    valid_chars.splice(index, 1);
                }
            }
        }

        // only use a unique set of chars
        valid_chars = unique_array(valid_chars);

        // build the password based on the user input
        password = [];
        for (let i = 0; i < id_segments.value; i++) {
            choices = random_choices(valid_chars, id_length.value).join('');
            password.push(choices);
        }

        // set the password in field
        password_string = password.join(delimiter);
        id_password.value = password_string;

        store_user_interface();
    }
}

document.addEventListener('DOMContentLoaded', generate_password_init);