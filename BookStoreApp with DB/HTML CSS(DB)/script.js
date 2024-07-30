$(document).ready(function() {
    let currentPage = 1;
    const pageSize = 10;

    // Function to display books in the table

    function displayBooks(books) {
        console.log('Displaying books:', books);
        $('tbody').empty();
        if (books.length === 0) {
            $('tbody').append('<tr><td colspan="6">No books found</td></tr>');
        } else {
            books.forEach(function(book) {
                $('tbody').append(
                    `<tr>
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.description}</td>
                        <td>${book.price}</td>
                        <td>${book.availability}</td>
                    </tr>`
                );
            });
        }
    }

    // Function to fetch books from the server with optional search query and pagination

    function fetchBooks(query = '', page = 1, pageSize = 10) {
        console.log('Fetching books with query:', query, 'page:', page, 'pageSize:', pageSize);
        $.ajax({
            url: `https://localhost:7166/api/Books?title=${query}&page=${page}&pageSize=${pageSize}`,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('Books data received:', data);
                displayBooks(data.books);
                if (query) {
                    $('#search-message').text('Check Available book section'); // Update message in the HTML
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching books:', textStatus, errorThrown);
            }
        });
    }


    // Event handler for search bar input


    $('#search-bar').on('input', function() {
        var query = $(this).val();
        currentPage = 1;
        fetchBooks(query, currentPage);
    });


    // Event handler for search bar focus and blur


    $('#search-bar').on('focus', function() {
        $(this).attr('placeholder', 'Enter book title');
    }).on('blur', function() {
        $(this).attr('placeholder', '');
    });


    // Event handler for Enter key press in search bar


    $('#search-bar').on('keypress', function(e) {
        if (e.which === 13) { // Enter key pressed
            e.preventDefault(); // Prevent form submission
            var query = $(this).val();
            currentPage = 1;
            fetchBooks(query, currentPage);
            $('#search-message').text('Check Available book section'); // Update message in the HTML
        }
    });


    // Event handler for "Load More Books" button


    $('#load-more-btn').click(function() {
        currentPage++;
        var query = $('#search-bar').val();
        fetchBooks(query, currentPage);
    });


    // Event handler for adding a new book


    $('#add-book-form').on('submit', function(e) {
        e.preventDefault();

        var newBook = {
            title: $('#title').val(),
            author: $('#author').val(),
            description: $('#description').val(),
            imageUrl: $('#imageUrl').val(),
            price: parseFloat($('#price').val()), // Ensure price is parsed as a float
            availability: $('#availability').val()
        };

        $.ajax({
            url: 'https://localhost:7166/api/Books',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newBook),
            success: function() {
                $('#add-book-form')[0].reset();
                currentPage = 1;
                fetchBooks($('#search-bar').val(), currentPage);
                updateFeaturedBooks(); // Update featured books section after adding new book
                alert('New book has been added successfully.');

                // Scroll to "Available Books" section after adding the book
                $('html, body').animate({
                    scrollTop: $('#available-books').offset().top
                }, 800); // Adjust the duration as needed
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error adding book:', textStatus, errorThrown);
                alert('Failed to add book. Please try again later.');
            }
        });
    });


    // Event handler for contact form submission


    $('#contact-form').on('submit', function(e) {
        e.preventDefault();

        var formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            subject: $('#subject').val(),
            message: $('#message').val(),
            rating: $('#rating').val() // Ensure this is included and correctly formatted
        };

        $.ajax({
            url: 'https://localhost:7166/api/Comments',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function() {
                $('#contact-form')[0].reset();
                fetchComments(); // Refresh comments after adding a new one
                alert('Message sent successfully!');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error sending message:', textStatus, errorThrown);
                alert('Failed to send message. Please try again later.');
            }
        });
    });



    // Function to generate star ratings based on rating value


    function generateStars(rating) {
        console.log('Generating stars for rating:', rating);
        let stars = '';
        // Ensure rating is a number between 1 and 5
        rating = parseInt(rating, 10);
        rating = isNaN(rating) ? 0 : Math.max(1, Math.min(rating, 5));
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<span class="star">&#9733;</span>'; // Full star
            } else {
                stars += '<span class="star">&#9734;</span>'; // Empty star
            }
        }
        console.log('Generated stars:', stars);
        return stars;
    }


    // Function to highlight store name in comments


    function highlightStoreName(text) {
        console.log('Highlighting store name in text:', text);
        const highlightedText = text.replace(/My Online Book Store/g, '<span class="store-name highlight">My Online Book Store</span>');
        console.log('Highlighted text:', highlightedText);
        return highlightedText;
    }


    // Function to fetch and display comments


    function fetchComments() {
        $.ajax({
            url: 'https://localhost:7166/api/Comments',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log('Comments data received:', data);
                $('#dynamic-reviews').empty(); // Clear existing reviews
                
                if (data.length === 0) {
                    $('#dynamic-reviews').append('<p>No comments available.</p>');
                } else {
                    data.forEach(function(comment) {
                        const highlightedMessage = highlightStoreName(comment.message);
                        const stars = generateStars(comment.rating);
                        $('#dynamic-reviews').append(`
                            <div class="comment-container">
                                <div class="rating">${stars}</div>
                                <p class="comment-text">${highlightedMessage}</p>
                                <p><strong>${comment.name}</strong>: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(comment.email)}" target="_blank">Customer's Profile</a></p>
                            </div>
                        `);
                    });
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching comments:', textStatus, errorThrown);
            }
        });
    }


    // Function to update featured books section


    function updateFeaturedBooks() {
        $.ajax({
            url: 'https://localhost:7166/api/Books/featured-books',
            method: 'GET',
            success: function(data) {
                console.log('Featured books data received:', data);
                data.forEach((book, index) => {
                    const featuredBook = $(`#featured-book-${index + 1}`);
                    if (featuredBook.length) {
                        featuredBook.find('.featured-image').attr('src', book.imageUrl);
                        featuredBook.find('.book-title').text(book.title);
                        featuredBook.find('.book-author').text(book.author);
                        featuredBook.find('.book-price').text(book.price);
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch featured books:', error);
            }
        });
    }


    // Initial fetch on page load


    fetchBooks('', currentPage);
    fetchComments(); // Fetch and display comments on page load
    updateFeaturedBooks(); // Fetch and display featured books on page load

    // Event handler for dropdown selection to scroll to the target section
    $('#section-dropdown').on('change', function() {
        var selectedValue = $(this).val();
        var targetSection = $('#' + selectedValue);

        if (targetSection.length) {
            targetSection[0].scrollIntoView({ behavior: 'smooth' });
        }
    });


    // Event handler for dropdown menu links to scroll to the target section

    
    $('.dropdown-content a').on('click', function(e) {
        e.preventDefault();
        var targetId = $(this).data('target');
        var targetSection = $('#' + targetId);

        if (targetSection.length) {
            $('html, body').animate({
                scrollTop: targetSection.offset().top
            }, 800); // Adjust the duration as needed
        }
    });
});
