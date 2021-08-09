const { MongoClient } = require('mongodb');

async function main() {

    const uri = "mongodb+srv://demo:12344321@cluster0.zpxqd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    const client = new MongoClient(uri);

    try {
// Connect to the MongoDB cluster
        await client.connect();

// Create a single new listing
        await createListing(client,
            {
                borough: "B7",
                cuisine: "Sussi",
                name: "Japanika"
            }
        );

 // Create 2 new listings
        await createMultipleListings(client, [
            {
                borough: "TA",
                cuisine: "Pizza",
                name: "Dominos"
            },
            {
                borough: "Ashdod",
                cuisine: "Fast Food",
                name: "BBB"
            }
        ]);


// Find the listing named "BBB" that we created 
        await findOneListingByName(client, "BBB");

// Find the listing named "AAA" which no exist
        await findOneListingByName(client, "AAA");

// Find the listing In Brooklyn With Kosher Cuisine
        await findListingInSpecificBoroughWithSpecificCuisine(client, {
            borough: "Brooklyn",
            cuisine: "Jewish/Kosher"
        });

// Update the "Japanika" listing 
        await updateListingByName(client, "Japanika", { cuisine: "Sussi_Israel", borough: "Israel" });        

// Find the listing named "Japanika" that we updated 
        await findOneListingByName(client, "Japanika");

// Delete the listing named "Dominos" 
        await deleteListingByName(client, "Dominos");


    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);


// Create a single new listing
async function createListing(client, newListing){
    
    const result = await client.db("sample_restaurants").collection("restaurants").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}
 

// Create multiple new listings
async function createMultipleListings(client, newListings){
    
    const result = await client.db("sample_restaurants").collection("restaurants").insertMany(newListings);

    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}


// Find the listing by named 
async function findOneListingByName(client, nameOfListing) {
    
    const result = await client.db("sample_restaurants").collection("restaurants").findOne({ name: nameOfListing });

    if (result) {
        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}


// Find the listing In Specific Borough With Specific Cuisine
async function findListingInSpecificBoroughWithSpecificCuisine(client, {
    borough = "",
    cuisine = ""
} = {}) {
    
    const cursor = await client.db("sample_restaurants").collection("restaurants").find(
    { 
        borough: { $gte: borough },
        cuisine: { $gte: cuisine }
    })
    .sort({ last_review: -1 });

    // Store the results in an array
    const results = await cursor.toArray();


    if (results.length > 0) {
        console.log(`Found a listing(s) in the ${borough} with the '${cuisine} cuisine ':`);
        results.forEach((result, i) => {
            const date = new Date(result.last_review).toDateString();

            console.log('==============================');
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   borough: ${result.borough}`);
            console.log(`   cuisine: ${result.cuisine}`);
            console.log(`   most recent review date: ${date}`);
        });
    } else {
        console.log(`No listings found in the ${borough} with the '${cuisine} cuisine'`);
    }
}


// Update a Restaurants listing with the given name. 
async function updateListingByName(client, nameOfListing, updatedListing) {
       const result = await client.db("sample_restaurants").collection("restaurants").updateOne({ name: nameOfListing }, { $set: updatedListing });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}


// Delete a Restaurants listing with the given name.
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_restaurants").collection("restaurants").deleteOne({ name: nameOfListing });
    console.log(`$Document(s) was/were deleted.`);
}

